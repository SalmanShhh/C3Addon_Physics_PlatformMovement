import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";



export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();

      // Physics sibling reference
      this._phys = null;

      // Config — read from editor properties
      const properties = this._getInitProperties();
      this._maxSpeed         = properties[0];
      this._acceleration     = properties[1];
      this._deceleration     = properties[2];
      this._jumpStrength     = properties[3];
      this._gravity          = properties[4];
      this._maxFallSpeed     = properties[5];
      this._slopeTolerance   = properties[6];
      this._coyoteTime       = properties[7];
      this._wallCoyoteTime   = properties[8];
      this._jumpBuffer       = properties[9];
      this._maxJumps         = properties[10];
      this._wallSlide        = properties[11];
      this._wallSlideSpeed   = properties[12];
      this._wallJump         = properties[13];
      this._wallJumpStrength = properties[14];
      this._variableJump     = properties[15];
      this._jumpReleaseDamping = properties[16] / 100;
      this._debugMode        = properties[17];

      // Runtime state — contact classification
      this._onFloor = false;
      this._onCeiling = false;
      this._onWallLeft = false;
      this._onWallRight = false;
      this._floorContactCount = 0;
      this._wallContactSide = 0;
      this._wasOnCeiling = false;
      this._floorNormalX = 0;    // outward floor surface normal X; updated each tick when grounded
      this._floorNormalY = -1;   // default = straight up (Y negative = up in C3 coords)
      this._contactGrace = 0.05;   // seconds of contact absence before state clears (~3 frames at 60 fps)
      this._floorMissTime = 0;     // seconds since last raw floor contact
      this._wallLMissTime = 0;     // seconds since last raw left-wall contact
      this._wallRMissTime = 0;     // seconds since last raw right-wall contact

      // Runtime state — jumps and timers
      this._jumpsRemaining = this._maxJumps;
      this._coyoteTimer = 0;
      this._wallCoyoteTimer = 0;
      this._jumpBufferTimer = 0;
      this._airTime = 0;

      // Runtime state — input
      this._inputX = 0;
      this._jumpInputPressed = false;
      this._jumpInputReleased = false;
      this._stopInputThisTick = false;
      this._ignoreInput = false;

      // Runtime state — facing and previous-tick flags
      this._facing = 1;
      this._wasOnFloor = false;
      this._wasOnWall = false;
      this._lastWallSide = 0;
      this._wasFalling = false;
      this._isWallSliding = false;
      this._justJumped = false;   // true on the tick a jump fires; prevents coyote timer starting


      // Lifecycle
      this._enabled = true;

      // Freeze axis
      this._freezeX = false;
      this._freezeY = false;

      // Driven velocity & simulated jump tracking
      this._drivenTimer = 0;
      this._drivenVx = 0;
      this._simulatedJumpHeld = false;
      this._prevSimulatedJumpHeld = false;

      // Events
      this.events = {};

      // Enable ticking
      this._setTicking(true);
    }

    _trigger(method) {
      this.dispatch(method);
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    on(tag, callback, options) {
      if (!this.events[tag]) {
        this.events[tag] = [];
      }
      this.events[tag].push({ callback, options });
    }

    off(tag, callback) {
      if (this.events[tag]) {
        this.events[tag] = this.events[tag].filter(
          (event) => event.callback !== callback
        );
      }
    }

    dispatch(tag) {
      if (this.events[tag]) {
        this.events[tag].forEach((event) => {
          if (event.options && event.options.params) {
            const fn = self.C3[AddonTypeMap[addonType]][id].Cnds[tag];
            if (fn && !fn.call(this, ...event.options.params)) {
              return;
            }
          }
          event.callback();
          if (event.options && event.options.once) {
            this.off(tag, event.callback);
          }
        });
      }
    }

    _tick() {
      const dt = this.instance.runtime.dt;

      // Locate Physics sibling on the first tick (this.instance not available in constructor).
      if (!this._phys) {
        this._phys = this.instance.behaviors["Physics"] ?? null;
        if (!this._phys) {
          for (const b of Object.values(this.instance.behaviors)) {
            if (b.behaviorType && b.behaviorType.name === "Physics") {
              this._phys = b;
              break;
            }
          }
        }
        if (!this._phys) {
          console.warn("[PlatformerPhysics] Physics behavior not found on instance. Disabling.");
          this._enabled = false;
        }
      }

      if (!this._enabled || !this._phys) return;

      // ── SIMULATED JUMP AUTO-RELEASE ─────────────────────────────────────
      if (this._prevSimulatedJumpHeld && !this._simulatedJumpHeld) {
        this._jumpInputReleased = true;
      }
      this._prevSimulatedJumpHeld = this._simulatedJumpHeld;
      this._simulatedJumpHeld = false;

      // Clamp analogue input
      this._inputX = Math.max(-1, Math.min(1, this._inputX));

      // ── CONTACT CLASSIFICATION ──────────────────────────────────────────
      this._onFloor = false;
      this._onCeiling = false;
      this._onWallLeft = false;
      this._onWallRight = false;
      this._floorContactCount = 0;

      const instCX = this.instance.x;
      const instCY = this.instance.y;
      const halfH = this.instance.height / 2;
      const halfW = this.instance.width / 2;

      let floorSumX = 0;
      let floorSumY = 0;
      const contactCount = this._phys.getContactCount();
      for (let i = 0; i < contactCount; i++) {
        const cx = this._phys.getContactX(i);
        const cy = this._phys.getContactY(i);

        const dy = cy - instCY;
        const dx = cx - instCX;

        // Normalize deltas by the half-extents so that the comparison is
        // aspect-ratio-aware and works for any collision shape (box, polygon,
        // circle, capsule). A contact point is classified as whichever axis it
        // is proportionally further from the center on.
        //
        // For circles/capsules, contact points sit exactly to the side or
        // above/below, so normDx vs normDy is unambiguous.
        //
        // For boxes/polygons, Box2D places contacts at the corners of the
        // touching face. The dual independent-if approach previously caused
        // corner contacts to set BOTH _onWallLeft/_onWallRight AND _onFloor,
        // which broke wall-slide detection (guarded by !this._onFloor).
        // The normalized comparison assigns each contact point to exactly one
        // category, fixing wall slide for all shapes.
        const normDx = halfW > 0 ? Math.abs(dx) / halfW : 0;
        const normDy = halfH > 0 ? Math.abs(dy) / halfH : 0;

        // _slopeTolerance biases the wall/floor boundary toward floor classification.
        // At 0 the comparison is identical to the previous normDx >= normDy.
        // At 0.35 (default) a contact must be substantially more horizontal than
        // vertical to register as a wall, preventing sloped-surface and corner
        // contacts from spuriously triggering wall-slide or wall-jump.
        if (normDx * (1 - this._slopeTolerance) >= normDy) {
          // Horizontal dominates beyond slope tolerance → wall contact
          if (dx < 0) {
            this._onWallLeft = true;
          } else {
            this._onWallRight = true;
          }
        } else {
          // Vertical dominates (or within slope tolerance) → floor or ceiling
          if (dy > 0) {
            this._onFloor = true;
            this._floorContactCount++;
            floorSumX += dx;
            floorSumY += dy;
          } else {
            this._onCeiling = true;
          }
        }
      }

      // ── FLOOR NORMAL ──────────────────────────────────────────────────────────
      // Derive an approximate outward floor surface normal from contact offsets.
      // The vector from the instance center to each floor contact point is the
      // inward direction (toward the surface). Negate the average and normalize
      // to get the outward normal. Only updated when raw contacts exist — during
      // grace-window frames the last valid normal is preserved so callers always
      // receive a meaningful direction even for 1-2 frames of contact jitter.
      if (this._floorContactCount > 0) {
        const nx = -floorSumX;
        const ny = -floorSumY;
        const len = Math.sqrt(nx * nx + ny * ny);
        if (len > 0) {
          this._floorNormalX = nx / len;
          this._floorNormalY = ny / len;
        }
      }

      // ── CONTACT ANTI-JITTER ──────────────────────────────────────────────────
      // Box2D can silently drop valid contacts for 1–2 consecutive simulation
      // steps. Without mitigation this causes: OnLanded / OnFallenOff firing
      // repeatedly while continuously grounded; _jumpsRemaining resetting on
      // every glitch tick; OnLeftWallContact triggering during momentary wall
      // contact loss. _contactGrace consecutive frames of absence are required
      // before a contact state clears. Grace is forcibly expired on any jump.
      if (this._onFloor) {
        this._floorMissFrames = 0;
      } else {
        this._floorMissFrames++;
        if (this._floorMissFrames <= this._contactGrace) this._onFloor = true;
      }

      if (this._onWallLeft) {
        this._wallLMissFrames = 0;
      } else {
        this._wallLMissFrames++;
        if (this._wallLMissFrames <= this._contactGrace) this._onWallLeft = true;
      }

      if (this._onWallRight) {
        this._wallRMissFrames = 0;
      } else {
        this._wallRMissFrames++;
        if (this._wallRMissFrames <= this._contactGrace) this._onWallRight = true;
      }

      // Update wall contact side
      if (this._onWallLeft && !this._onWallRight) {
        this._wallContactSide = -1;
      } else if (this._onWallRight && !this._onWallLeft) {
        this._wallContactSide = 1;
      } else if (!this._onWallLeft && !this._onWallRight) {
        this._wallContactSide = 0;
      }

      // ── WALL COYOTE TIME ─────────────────────────────────────────────────
      const onWallNow = this._onWallLeft || this._onWallRight;
      if (onWallNow && !this._onFloor) {
        // Actively on a wall — record side, reset coyote timer, mark state
        this._lastWallSide = this._wallContactSide;
        this._wallCoyoteTimer = 0;
        this._wasOnWall = true;
      } else {
        this._wallCoyoteTimer = Math.max(0, this._wallCoyoteTimer - this.instance.dt);
        if (this._wasOnWall && !this._onFloor) {
          // Just left wall without landing — start wall coyote window
          this._wallCoyoteTimer = this._wallCoyoteTime;
          this._trigger("OnLeftWallContact");
        }
        if (this._onFloor) {
          // Landed — clear wall coyote state
          this._wallCoyoteTimer = 0;
          this._lastWallSide = 0;
        }
        this._wasOnWall = false;
      }

      // ── FLOOR TRANSITION EVENTS ─────────────────────────────────────────
      if (this._onFloor) {
        if (!this._wasOnFloor) {
          // Just landed
          this._jumpsRemaining = this._maxJumps;
          this._coyoteTimer = 0;
          this._airTime = 0;
          this._trigger("OnLanded");
        }
        this._wasOnFloor = true;
      } else {
        this._coyoteTimer = Math.max(0, this._coyoteTimer - this.instance.dt);
        if (this._wasOnFloor && !this._justJumped) {
          // Fallen off a ledge (not a deliberate jump)
          this._coyoteTimer = this._coyoteTime;
          this._trigger("OnFallenOff");
        }
        this._justJumped = false;  // clear after the floor→air transition check
        this._wasOnFloor = false;
      }

      // ── AIRTIME ──────────────────────────────────────────────────────────
      if (!this._onFloor) {
        this._airTime += this.instance.dt;
      }

      // ── TIMERS ──────────────────────────────────────────────────────────
      if (this._jumpInputPressed) {
        this._jumpBufferTimer = this._jumpBuffer;
      } else {
        this._jumpBufferTimer = Math.max(0, this._jumpBufferTimer - this.instance.dt);
      }

      // ── FALLING STATE TRANSITION ────────────────────────────────────────
      const vy = this._phys.getVelocityY();
      const isFallingNow = !this._onFloor && vy > 0;
      this._wasFalling = isFallingNow;

      // ── STOP INPUT ──────────────────────────────────────────────────────
      if (this._stopInputThisTick) {
        this._phys.setVelocity(0, 0);
        this._inputX = 0;
        this._jumpInputPressed = false;
        this._jumpInputReleased = false;
        this._stopInputThisTick = false;
        // Clear remaining input and return early since we stopped
        return;
      }

      // ── DRIVEN VELOCITY TIMER ────────────────────────────────────────────
      const inDriven = this._drivenTimer > 0;
      if (inDriven) {
        this._drivenTimer = Math.max(0, this._drivenTimer - this.instance.dt);
        this._inputX = 0;
        this._jumpInputPressed = false;
        this._jumpInputReleased = false;
      }

      // ── HORIZONTAL MOVEMENT ─────────────────────────────────────────────
      let vx = this._phys.getVelocityX();

      if (!inDriven) {
        if (this._inputX !== 0) {
          // Accelerate toward target speed
          const targetVx = this._inputX * this._maxSpeed;
          const diff = targetVx - vx;
          const step = this._acceleration * dt;

          if (Math.abs(diff) <= step) {
            vx = targetVx;
          } else {
            vx += Math.sign(diff) * step;
          }
        } else {
          // Decelerate toward zero
          const step = this._deceleration * dt;
          if (Math.abs(vx) <= step) {
            vx = 0;
          } else {
            vx -= Math.sign(vx) * step;
          }
        }

        // Clamp to max speed
        vx = Math.max(-this._maxSpeed, Math.min(this._maxSpeed, vx));
      } else {
        vx = this._drivenVx;
      }

      // ── FACING ──────────────────────────────────────────────────────────
      if (this._inputX !== 0) {
        const newFacing = this._inputX > 0 ? 1 : -1;
        if (newFacing !== this._facing) {
          this._facing = newFacing;
          this._trigger("OnFacingChanged");
        }
      }

      // ── JUMP LOGIC ─────────────────────────────────────────────────────
      let currentVy = this._phys.getVelocityY();
      let jumped = false;
      let isWallJump = false;

      const wantJump = this._jumpInputPressed || this._jumpBufferTimer > 0;

      if (wantJump && !inDriven) {
        // Wall jump check (includes wall coyote window)
        const canWallJump = this._onWallLeft || this._onWallRight || this._wallCoyoteTimer > 0;
        if (this._wallJump && !this._onFloor && canWallJump) {
          // Determine which side to push away from:
          // Use the current contact if on a wall, otherwise fall back to the last known side
          const wallSide = (this._onWallLeft || this._onWallRight)
            ? this._wallContactSide
            : this._lastWallSide;
          const wallDir = wallSide < 0 ? 1 : -1; // push away from wall
          this._phys.setVelocity(0, 0);
          vx = wallDir * this._wallJumpStrength;
          currentVy = -this._jumpStrength;
          jumped = true;
          isWallJump = true;
          this._wallCoyoteTimer = 0;
          this._wasOnWall = false; // prevent OnLeftWallContact from firing next tick
          this._jumpBufferTimer = 0;
          this._justJumped = true;
          // Expire grace on all contacts so the character immediately enters
          // the airborne state — prevents the grace window from stalling the
          // floor/wall → air transition for 2 extra frames after the jump.
          this._floorMissTime = this._contactGrace + 1;
          this._wallLMissTime = this._contactGrace + 1;
          this._wallRMissTime = this._contactGrace + 1;
          this._trigger("OnWallJumped");
          this._trigger("OnJumped");
        }
        // Floor / coyote / multi-jump
        else if (this._onFloor || this._coyoteTimer > 0 || this._jumpsRemaining > 0) {
          const jumpIndex = this._maxJumps - this._jumpsRemaining + 1;
          this._jumpsRemaining = Math.max(0, this._jumpsRemaining - 1);
          currentVy = -this._jumpStrength;
          jumped = true;
          this._justJumped = true;
          this._floorMissTime = this._contactGrace + 1; // expire grace immediately
          this._coyoteTimer = 0;
          this._jumpBufferTimer = 0;
          this._trigger("OnJumped");
          if (jumpIndex >= 2) {
            this._trigger("OnDoubleJumped");
          }
        }
      }

      // ── VARIABLE JUMP HEIGHT ────────────────────────────────────────────
      if (this._variableJump && this._jumpInputReleased && currentVy < 0) {
        currentVy *= this._jumpReleaseDamping;
      }

      // ── CEILING BONK ────────────────────────────────────────────────────
      if (this._onCeiling) {
        if (!this._wasOnCeiling) {
          this._trigger("OnHitCeiling");
        }
        if (currentVy < 0) {
          currentVy = 0;
        }
        this._wasOnCeiling = true;
      } else {
        this._wasOnCeiling = false;
      }

      // ── GRAVITY ─────────────────────────────────────────────────────────
      if (this._gravity !== 0) {
        currentVy += this._gravity * dt;
      }

      // ── WALL SLIDE ──────────────────────────────────────────────────────
      this._isWallSliding = false;
      if (this._wallSlide && !this._onFloor && !this._onCeiling && currentVy > 0) {
        const pressingIntoWall =
          (this._onWallLeft && this._inputX < 0) ||
          (this._onWallRight && this._inputX > 0);
        if (pressingIntoWall) {
          this._isWallSliding = true;
          if (currentVy > this._wallSlideSpeed) {
            currentVy = this._wallSlideSpeed;
          }
        }
      }

      // ── FLOOR VELOCITY CLAMP ──────────────────────────────────────────────
      // Prevent Physics restitution (bounciness) from bouncing the character off
      // the floor. When grounded and not actively jumping, any upward velocity
      // read back from Box2D after a contact impulse is discarded here.
      // Note: set the Physics behavior "Bounciness" to 0 to eliminate the source.
      //
      // _justJumped guard: at low timescale (or low frame rate) Physics barely
      // moves the body after a jump fires. Box2D can still report a floor
      // contact on the very next frame while the character is launching upward.
      // Without this guard the clamp would zero the jump velocity immediately,
      // making the character unable to leave the ground. _justJumped stays true
      // until the character enters the airborne state, suppressing the clamp
      // for as many frames as the post-jump contact persists.
      if (this._onFloor && !jumped && !this._justJumped) {
        if (currentVy < 0) currentVy = 0;
      }

      // ── MAX FALL SPEED CLAMP ────────────────────────────────────────────
      if (currentVy > this._maxFallSpeed) {
        currentVy = this._maxFallSpeed;
      }

      // ── APPLY VELOCITY ──────────────────────────────────────────────────
      if (this._freezeX) vx = 0;
      if (this._freezeY) currentVy = 0;
      this._phys.setVelocity(vx, currentVy);

      // ── CONSUME FLOOR JUMP COUNT ON LEAVING FLOOR ───────────────────────
      if (!this._onFloor && this._wasOnFloor === false && jumped) {
        // Already decremented above
      }

      // ── DEBUG ───────────────────────────────────────────────────────────
      if (this._debugMode) {
        const wallStr = this._onWallLeft ? "L" : this._onWallRight ? "R" : "none";
        const facingStr = this._facing === 1 ? "R" : "L";
        console.log(
          `[Physics Platform Movement] floor=${this._onFloor ? 1 : 0}(${this._floorContactCount}) wall=${wallStr} ceil=${this._onCeiling} | vx=${vx.toFixed(1)} vy=${currentVy.toFixed(1)} | jumps=${this._jumpsRemaining}/${this._maxJumps} coyote=${this._coyoteTimer.toFixed(3)} buf=${this._jumpBufferTimer.toFixed(3)} air=${this._airTime.toFixed(2)}s | slide=${this._isWallSliding} facing=${facingStr}`
        );
      }

      // ── CLEAR PER-TICK INPUT ────────────────────────────────────────────
      this._inputX = 0;
      this._jumpInputPressed = false;
      this._jumpInputReleased = false;
      this._stopInputThisTick = false;
    }

    _release() {
      super._release();
    }

    // ── PUBLIC SCRIPTING API ──────────────────────────────────────────────

    // ── Configuration ─────────────────────────────────────────────────────

    /** Set the maximum horizontal running speed (px/s). @param {number} speed */
    setMaxSpeed(speed) { this._maxSpeed = speed; }

    /** Set how quickly the character reaches max speed (px/s²). @param {number} accel */
    setAcceleration(accel) { this._acceleration = accel; }

    /** Set how quickly the character slows to a stop when no input is given (px/s²). @param {number} decel */
    setDeceleration(decel) { this._deceleration = decel; }

    /** Set the initial upward velocity applied when jumping (px/s). @param {number} strength */
    setJumpStrength(strength) { this._jumpStrength = strength; }

    /** Set the additional downward gravity applied each tick (px/s²). 0 = rely on Physics gravity only. @param {number} gravity */
    setGravity(gravity) { this._gravity = gravity; }

    /** Set the terminal falling speed the character cannot exceed (px/s). @param {number} speed */
    setMaxFallSpeed(speed) { this._maxFallSpeed = speed; }

    /** Set how long (seconds) after leaving a floor edge a jump is still allowed. @param {number} time */
    setCoyoteTime(time) { this._coyoteTime = Math.max(0, time); }

    /** Set how long (seconds) a jump press is remembered before landing. @param {number} time */
    setJumpBuffer(time) { this._jumpBuffer = Math.max(0, time); }

    /** Enable or disable console debug output each tick. @param {boolean} enabled */
    setDebugMode(enabled) { this._debugMode = !!enabled; }

    /** Set how long (seconds) contact must be absent before that state clears. @param {number} seconds */
    setContactGrace(seconds) { this._contactGrace = Math.max(0, seconds); }

    // ── Jumping ───────────────────────────────────────────────────────────

    /** Restore all jumps as if the character just landed on the floor. */
    resetJumps() { this._jumpsRemaining = this._maxJumps; }

    /**
     * Set what fraction of upward velocity is kept when the jump button is released early.
     * @param {number} percent - 0–100. 0 = instant cut, 100 = no variable height. Default 50.
     */
    setJumpReleaseDamping(percent) {
      this._jumpReleaseDamping = Math.max(0, Math.min(100, percent)) / 100;
    }

    /** Set how many times the character can jump before landing. 1 = normal, 2 = double jump, etc. @param {number} count */
    setMaxJumps(count) { this._maxJumps = Math.max(0, Math.floor(count)); }

    /** Enable or disable the ability to jump off walls. @param {boolean} enabled */
    setWallJump(enabled) { this._wallJump = !!enabled; }

    /** Enable or disable sliding down walls by pressing into them while airborne. @param {boolean} enabled */
    setWallSlide(enabled) { this._wallSlide = !!enabled; }

    /** Set how long (seconds) after leaving a wall a wall jump is still allowed. @param {number} time */
    setWallCoyoteTime(time) { this._wallCoyoteTime = Math.max(0, time); }

    /** Set the maximum fall speed (px/s) while wall sliding. @param {number} speed */
    setWallSlideSpeed(speed) { this._wallSlideSpeed = speed; }

    /** Set the horizontal impulse component of a wall jump (px/s). @param {number} strength */
    setWallJumpStrength(strength) { this._wallJumpStrength = strength; }

    /** Enable or disable variable jump height. When enabled, releasing jump early cuts upward velocity. @param {boolean} enabled */
    setVariableJumpHeight(enabled) { this._variableJump = !!enabled; }

    // ── Movement ──────────────────────────────────────────────────────────

    /**
     * Enable or disable the entire behavior.
     * Disabling clears all contact flags, timers, and pending input.
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
      this._enabled = !!enabled;
      if (!this._enabled) {
        this._onFloor = false;
        this._onCeiling = false;
        this._onWallLeft = false;
        this._onWallRight = false;
        this._wasOnFloor = false;
        this._isWallSliding = false;
        this._jumpsRemaining = this._maxJumps;
        this._coyoteTimer = 0;
        this._jumpBufferTimer = 0;
        this._airTime = 0;
        this._inputX = 0;
        this._jumpInputPressed = false;
        this._jumpInputReleased = false;
        this._stopInputThisTick = false;
        this._floorMissTime = 0;
        this._wallLMissTime = 0;
        this._wallRMissTime = 0;
      }
    }

    /**
     * Freeze or unfreeze a movement axis so the character cannot accelerate along it.
     * @param {number} axis - 0 = Horizontal, 1 = Vertical, 2 = Both
     * @param {boolean} freeze - true to freeze, false to unfreeze
     */
    setFreezeAxis(axis, freeze) {
      const keys = ["horizontal", "vertical", "both"];
      const key = keys[axis] || keys[2];
      const val = !!freeze;
      if (key === "horizontal" || key === "both") this._freezeX = val;
      if (key === "vertical" || key === "both") this._freezeY = val;
    }

    /**
     * Override the ceiling contact state for this tick.
     * Setting true triggers the ceiling bonk (zeroes upward velocity) and fires OnHitCeiling on the first contact tick.
     * Note: _onCeiling is reclassified each tick from Physics contacts, so call every tick to sustain the override.
     * @param {boolean} onCeiling
     */
    setOnCeiling(onCeiling) {
      this._onCeiling = !!onCeiling;
      if (!onCeiling) {
        this._wasOnCeiling = false;
      }
    }

    /**
     * Override the floor contact state for this tick.
     * Setting true also resets jumps remaining and clears coyote/air timers as if the character just landed.
     * Note: _onFloor is reclassified each tick from Physics contacts, so call every tick to sustain the override.
     * @param {boolean} onFloor
     */
    setOnFloor(onFloor) {
      this._onFloor = !!onFloor;
      if (this._onFloor) {
        this._jumpsRemaining = this._maxJumps;
        this._coyoteTimer = 0;
        this._airTime = 0;
        this._wasOnFloor = true;
        this._floorMissTime = 0;
      } else {
        // Force the anti-jitter grace to expire so the override takes effect
        // immediately rather than being restored on the next tick.
        this._floorMissTime = this._contactGrace + 1;
      }
    }

    /** When true, all input (default controls and SimulateControl) is ignored. @param {boolean} ignore */
    setIgnoreInput(ignore) { this._ignoreInput = !!ignore; }

    /** Directly set both Physics velocity components (px/s). @param {number} vx @param {number} vy */
    setVelocity(vx, vy) {
      if (this._phys) this._phys.setVelocity(vx, vy);
    }

    /** Directly set the horizontal Physics velocity, preserving vertical (px/s). @param {number} vx */
    setVectorX(vx) {
      if (this._phys) this._phys.setVelocity(vx, this._phys.getVelocityY());
    }

    /** Directly set the vertical Physics velocity, preserving horizontal (px/s). Negative = up. @param {number} vy */
    setVectorY(vy) {
      if (this._phys) this._phys.setVelocity(this._phys.getVelocityX(), vy);
    }

    /**
     * Simulate a control input for this tick. Respects ignoreInput.
     * Accepts a numeric index (0–4) or a string (case-insensitive, spaces/underscores ignored).
     * If "jump" is passed every tick, the jump-release is automatically fired the tick after it stops.
     * @param {number|string} control - 0/"left", 1/"right", 2/"jump", 3/"jumprelease", 4/"stop"
     */
    simulateControl(control) {
      if (this._ignoreInput) return;
      let key;
      if (typeof control === "string") {
        const normalized = control.toLowerCase().replace(/[\s_-]/g, "");
        const stringMap = {
          left: "left",
          right: "right",
          jump: "jump",
          jumprelease: "jump_release",
          stop: "stop",
        };
        key = stringMap[normalized] ?? "left";
      } else {
        const keys = ["left", "right", "jump", "jump_release", "stop"];
        key = keys[control] ?? "left";
      }
      switch (key) {
        case "left":
          this._inputX -= 1;
          break;
        case "right":
          this._inputX += 1;
          break;
        case "jump":
          // Only register as a fresh press if the jump button was not already
          // held last tick. This makes SimulateControl("Jump") safe to call
          // every tick via a "key is down" event without firing multiple jumps.
          if (!this._prevSimulatedJumpHeld) {
            this._jumpInputPressed = true;
          }
          this._simulatedJumpHeld = true;
          break;
        case "jump_release":
          this._jumpInputReleased = true;
          break;
        case "stop":
          this._stopInputThisTick = true;
          break;
      }
    }

    /** Instantly zero both velocity components. */
    stop() {
      if (this._phys) this._phys.setVelocity(0, 0);
    }

    // ── Ability state getters ─────────────────────────────────────────────

    /** Returns true if Coyote Time is enabled (duration > 0). */
    get isCoyoteTimeEnabled() { return this._coyoteTime > 0; }

    /** Returns true if Wall Sliding is enabled. */
    get isWallSlidingEnabled() { return this._wallSlide; }

    /** Returns true if Wall Jump is enabled. */
    get isWallJumpEnabled() { return this._wallJump; }

    /** Returns true if Variable Jump Height is enabled. */
    get isVariableJumpEnabled() { return this._variableJump; }

    // ── Read-only state getters ───────────────────────────────────────────
    // These expose numeric/velocity state that expressions provide in the event sheet
    // but are not reachable as simple properties from script.

    /** Current horizontal Physics velocity (px/s). Positive = right. */
    get vectorX() { return this._phys ? this._phys.getVelocityX() : 0; }

    /** Current vertical Physics velocity (px/s). Positive = down. */
    get vectorY() { return this._phys ? this._phys.getVelocityY() : 0; }

    /** Current velocity magnitude (px/s). */
    get speed() { const vx = this.vectorX; const vy = this.vectorY; return Math.sqrt(vx * vx + vy * vy); }

    /** Jumps remaining in the current airborne period. Resets on landing. */
    get jumpsRemaining() { return this._jumpsRemaining; }

    /** Seconds since last leaving floor contact. 0 while grounded. */
    get airTime() { return this._airTime; }

    /**
     * Approximate outward floor surface normal X component.
     * Derived from contact point offsets — accurate for flat and gently sloped
     * surfaces. Retains the last valid value while airborne (no raw contacts).
     * 0 while disabled or before first ground contact.
     */
    get floorNormalX() { return this._floorNormalX; }

    /**
     * Approximate outward floor surface normal Y component.
     * Negative = upward (C3 Y increases downward). -1 on flat ground.
     * Retains the last valid value while airborne.
     */
    get floorNormalY() { return this._floorNormalY; }

    /** -1 = left, 1 = right. */
    get facingDirection() { return this._facing; }

    /** -1 = left wall, 1 = right wall, 0 = no wall contact this tick. */
    get wallContactSide() { return this._wallContactSide; }

    /** Seconds remaining in the wall coyote window. 0 when not in a coyote window. */
    get wallCoyoteTimer() { return this._wallCoyoteTimer; }

    /** Current animation mode string: "Idle", "Moving", "Jumping", "Falling", "Wall sliding", or "Disabled". */
    get animMode() {
      if (!this._enabled) return "Disabled";
      if (this._isWallSliding) return "Wall sliding";
      const vx = this._phys ? this._phys.getVelocityX() : 0;
      const vy = this._phys ? this._phys.getVelocityY() : 0;
      if (this._onFloor && Math.abs(vx) > 0.5) return "Moving";
      if (this._onFloor) return "Idle";
      if (vy < 0) return "Jumping";
      return "Falling";
    }

    // ── Driven Velocity ───────────────────────────────────────────────────

    /**
     * Add an instantaneous velocity impulse to the current Physics velocity (px/s).
     * The behavior's deceleration will naturally taper the extra velocity off.
     * @param {number} vx - Horizontal impulse (positive = right)
     * @param {number} vy - Vertical impulse (positive = down)
     */
    applyImpulse(vx, vy) {
      if (this._phys) {
        this._phys.setVelocity(
          this._phys.getVelocityX() + vx,
          this._phys.getVelocityY() + vy
        );
      }
    }

    /**
     * Temporarily drives the character at the given velocity, suppressing movement
     * input for a fixed duration. Use for dashes, knockback, launch pads, or any
     * externally driven movement. Gravity, wall slide, and max fall speed still apply.
     * @param {number} vx - Horizontal velocity in px/s (positive = right)
     * @param {number} vy - Vertical velocity in px/s (positive = down)
     * @param {number} duration - Seconds to suppress input
     */
    drivenVelocity(vx, vy, duration) {
      this._drivenVx = vx;
      this._drivenTimer = Math.max(0, duration);
      if (this._phys) {
        this._phys.setVelocity(vx, vy);
      }
    }

    _saveToJson() {
      return {
        maxSpeed: this._maxSpeed,
        acceleration: this._acceleration,
        deceleration: this._deceleration,
        jumpStrength: this._jumpStrength,
        gravity: this._gravity,
        maxFallSpeed: this._maxFallSpeed,
        slopeTolerance: this._slopeTolerance,
        coyoteTime: this._coyoteTime,
        wallCoyoteTime: this._wallCoyoteTime,
        wallCoyoteTimer: this._wallCoyoteTimer,
        wasOnWall: this._wasOnWall,
        lastWallSide: this._lastWallSide,
        jumpBuffer: this._jumpBuffer,
        maxJumps: this._maxJumps,
        wallSlide: this._wallSlide,
        wallSlideSpeed: this._wallSlideSpeed,
        wallJump: this._wallJump,
        wallJumpStrength: this._wallJumpStrength,
        variableJump: this._variableJump,
        jumpReleaseDamping: this._jumpReleaseDamping,
        debugMode: this._debugMode,
        onFloor: this._onFloor,
        jumpsRemaining: this._jumpsRemaining,
        coyoteTimer: this._coyoteTimer,
        jumpBufferTimer: this._jumpBufferTimer,
        airTime: this._airTime,
        facing: this._facing,
        ignoreInput: this._ignoreInput,
        enabled: this._enabled,
        isWallSliding: this._isWallSliding,
        wallContactSide: this._wallContactSide,
        freezeX: this._freezeX,
        freezeY: this._freezeY,
        drivenTimer: this._drivenTimer,
        drivenVx: this._drivenVx,
      };
    }

    _loadFromJson(o) {
      this._maxSpeed = o.maxSpeed;
      this._acceleration = o.acceleration;
      this._deceleration = o.deceleration;
      this._jumpStrength = o.jumpStrength;
      this._gravity = o.gravity;
      this._maxFallSpeed = o.maxFallSpeed;
      this._slopeTolerance = o.slopeTolerance ?? 0.35;
      this._coyoteTime = o.coyoteTime ?? 0.1;
      this._wallCoyoteTime = o.wallCoyoteTime ?? 0;
      this._wallCoyoteTimer = o.wallCoyoteTimer ?? 0;
      this._wasOnWall = o.wasOnWall ?? false;
      this._lastWallSide = o.lastWallSide ?? 0;
      this._jumpBuffer = o.jumpBuffer ?? 0.1;
      this._maxJumps = o.maxJumps;
      this._wallSlide = o.wallSlide;
      this._wallSlideSpeed = o.wallSlideSpeed ?? 80;
      this._wallJump = o.wallJump;
      this._wallJumpStrength = o.wallJumpStrength ?? 450;
      this._variableJump = o.variableJump;
      this._jumpReleaseDamping = o.jumpReleaseDamping ?? 0.5;
      this._debugMode = o.debugMode ?? false;
      this._onFloor = o.onFloor;
      this._jumpsRemaining = o.jumpsRemaining;
      this._coyoteTimer = o.coyoteTimer;
      this._jumpBufferTimer = o.jumpBufferTimer;
      this._airTime = o.airTime;
      this._facing = o.facing;
      this._ignoreInput = o.ignoreInput;
      this._enabled = o.enabled;
      this._isWallSliding = o.isWallSliding;
      this._wallContactSide = o.wallContactSide;
      this._freezeX = o.freezeX ?? false;
      this._freezeY = o.freezeY ?? false;
      this._drivenTimer = o.drivenTimer ?? o.knockbackTimer ?? 0;
      this._drivenVx = o.drivenVx ?? 0;
    }

    _getDebuggerProperties() {
      if (!this._phys) return [];

      const [vx, vy] = this._phys.getVelocity();
      const animMode = this.animMode;

      return [
        {
          title: `$${this.behaviorType?.name ?? "Physics Platformer"}`,
          properties: [
            { name: "$Enabled",         value: this._enabled,        onedit: v => { this.setEnabled(!!v); } },
            { name: "$Vector X",        value: vx },
            { name: "$Vector Y",        value: vy },
            { name: "$Max speed",       value: this._maxSpeed,       onedit: v => { this._maxSpeed       = +v; } },
            { name: "$Acceleration",    value: this._acceleration,   onedit: v => { this._acceleration   = +v; } },
            { name: "$Deceleration",    value: this._deceleration,   onedit: v => { this._deceleration   = +v; } },
            { name: "$Jump strength",   value: this._jumpStrength,   onedit: v => { this._jumpStrength   = +v; } },
            { name: "$Gravity",         value: this._gravity,        onedit: v => { this._gravity        = +v; } },
            { name: "$Max fall speed",  value: this._maxFallSpeed,   onedit: v => { this._maxFallSpeed   = +v; } },
            { name: "$Max jumps",       value: this._maxJumps,       onedit: v => { this._maxJumps = Math.max(0, Math.floor(+v)); } },
            { name: "$Coyote time",     value: this._coyoteTime,     onedit: v => { this._coyoteTime     = Math.max(0, +v); } },
            { name: "$Wall coyote time", value: this._wallCoyoteTime, onedit: v => { this._wallCoyoteTime = Math.max(0, +v); } },
            { name: "$Jump buffer",     value: this._jumpBuffer,     onedit: v => { this._jumpBuffer     = Math.max(0, +v); } },
            { name: "$Variable jump",   value: this._variableJump,   onedit: v => { this._variableJump   = !!v; } },
            { name: "$Jump release damping", value: this._jumpReleaseDamping, onedit: v => { this._jumpReleaseDamping = Math.max(0, Math.min(1, +v)); } },
            { name: "$Jumps remaining", value: this._jumpsRemaining },
            { name: "$Animation mode",  value: animMode },
          ],
        },
      ];
    }
  };
}
