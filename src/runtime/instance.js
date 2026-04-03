import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();

      // Physics sibling reference
      this._phys = null;

      // Config — mirrored from properties for runtime-override support
      this._maxSpeed = 200;
      this._acceleration = 1500;
      this._deceleration = 1500;
      this._jumpStrength = 600;
      this._gravity = 0;
      this._maxFallSpeed = 1000;
      this._defaultControls = true;
      this._slopeTolerance = 0.35;
      this._coyoteTime = 0.1;
      this._jumpBuffer = 0.1;
      this._maxJumps = 1;
      this._wallSlide = false;
      this._wallSlideSpeed = 80;
      this._wallJump = false;
      this._wallJumpStrength = 450;
      this._variableJump = true;
      this._jumpReleaseDamping = 0.5;
      this._debugMode = false;

      // Runtime state — contact classification
      this._onFloor = false;
      this._onCeiling = false;
      this._onWallLeft = false;
      this._onWallRight = false;
      this._floorContactCount = 0;
      this._wallContactSide = 0;

      // Runtime state — jumps and timers
      this._jumpsRemaining = 1;
      this._coyoteTimer = 0;
      this._jumpBufferTimer = 0;
      this._airTime = 0;

      // Runtime state — input
      this._inputX = 0;
      this._jumpInputPressed = false;
      this._jumpInputReleased = false;
      this._stopInputThisTick = false;
      this._ignoreInput = false;
      this._prevKbLeft = false;
      this._prevKbRight = false;
      this._prevKbJump = false;

      // Direct key tracking (no Keyboard object needed)
      this._keysDown = new Set();
      this._onKeyDown = (e) => this._keysDown.add(e.key);
      this._onKeyUp = (e) => this._keysDown.delete(e.key);
      document.addEventListener("keydown", this._onKeyDown);
      document.addEventListener("keyup", this._onKeyUp);

      // Runtime state — facing and previous-tick flags
      this._facing = 1;
      this._wasOnFloor = false;
      this._wasFalling = false;
      this._isWallSliding = false;

      // Lifecycle
      this._enabled = true;
      this._initialized = false;

      // Freeze axis
      this._freezeX = false;
      this._freezeY = false;

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

      // ── INIT GUARD ──────────────────────────────────────────────────────
      if (!this._initialized) {
        this._initialized = true;

        const properties = this._getInitProperties();
        if (properties) {
          this._maxSpeed = properties[0];
          this._acceleration = properties[1];
          this._deceleration = properties[2];
          this._jumpStrength = properties[3];
          this._gravity = properties[4];
          this._maxFallSpeed = properties[5];
          this._defaultControls = properties[6];
          this._slopeTolerance = properties[7];
          this._coyoteTime = properties[8];
          this._jumpBuffer = properties[9];
          this._maxJumps = properties[10];
          this._wallSlide = properties[11];
          this._wallSlideSpeed = properties[12];
          this._wallJump = properties[13];
          this._wallJumpStrength = properties[14];
          this._variableJump = properties[15];
          this._debugMode = properties[16];
        }

        this._jumpsRemaining = this._maxJumps;

        // Locate Physics sibling
        for (const b of Object.values(this.instance.behaviors)) {
          if (b.behaviorType && b.behaviorType.name === "Physics") {
            this._phys = b;
            break;
          }
        }

        if (!this._phys) {
          console.warn("[GroundForce] Physics behavior not found on instance. Disabling.");
          this._enabled = false;
          return;
        }
      }

      if (!this._enabled || !this._phys) return;

      // ── DEFAULT CONTROLS ────────────────────────────────────────────────
      if (this._defaultControls && !this._ignoreInput) {
        const keys = this._keysDown;
        const kbLeft = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
        const kbRight = keys.has("ArrowRight") || keys.has("d") || keys.has("D");
        const kbJump = keys.has(" ") || keys.has("ArrowUp") || keys.has("w") || keys.has("W");

          if (kbLeft) this._inputX -= 1;
          if (kbRight) this._inputX += 1;

          // Edge detection for jump
          if (kbJump && !this._prevKbJump) {
            this._jumpInputPressed = true;
          }
          if (!kbJump && this._prevKbJump) {
            this._jumpInputReleased = true;
          }

          this._prevKbLeft = kbLeft;
          this._prevKbRight = kbRight;
          this._prevKbJump = kbJump;
      }

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

      const contactCount = this._phys.getContactCount();
      for (let i = 0; i < contactCount; i++) {
        const cx = this._phys.getContactX(i);
        const cy = this._phys.getContactY(i);

        const dy = cy - instCY;
        const dx = cx - instCX;

        // Floor: contact below center by slopeTolerance * halfHeight
        if (dy > this._slopeTolerance * halfH) {
          this._onFloor = true;
          this._floorContactCount++;
        }
        // Ceiling: contact above center
        else if (dy < -this._slopeTolerance * halfH) {
          this._onCeiling = true;
        }
        // Wall: within floor/ceiling band and far enough out horizontally
        else if (Math.abs(dx) > 0.4 * halfW) {
          if (dx < 0) {
            this._onWallLeft = true;
          } else {
            this._onWallRight = true;
          }
        }
      }

      // Update wall contact side
      if (this._onWallLeft && !this._onWallRight) {
        this._wallContactSide = -1;
      } else if (this._onWallRight && !this._onWallLeft) {
        this._wallContactSide = 1;
      } else if (!this._onWallLeft && !this._onWallRight) {
        this._wallContactSide = 0;
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
        this._coyoteTimer = Math.max(0, this._coyoteTimer - dt);
        if (this._wasOnFloor && !this._jumpInputPressed) {
          // Fallen off a ledge
          this._coyoteTimer = this._coyoteTime;
          this._trigger("OnFallenOff");
        }
        this._wasOnFloor = false;
      }

      // ── AIRTIME ──────────────────────────────────────────────────────────
      if (!this._onFloor) {
        this._airTime += dt;
      }

      // ── TIMERS ──────────────────────────────────────────────────────────
      if (this._jumpInputPressed) {
        this._jumpBufferTimer = this._jumpBuffer;
      } else {
        this._jumpBufferTimer = Math.max(0, this._jumpBufferTimer - dt);
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

      // ── HORIZONTAL MOVEMENT ─────────────────────────────────────────────
      let vx = this._phys.getVelocityX();

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

      if (wantJump) {
        // Wall jump check
        if (this._wallJump && !this._onFloor && (this._onWallLeft || this._onWallRight)) {
          // Wall jump
          const wallDir = this._onWallLeft ? 1 : -1; // push away from wall
          this._phys.setVelocity(0, 0);
          vx = wallDir * this._wallJumpStrength;
          currentVy = -this._jumpStrength;
          jumped = true;
          isWallJump = true;
          this._jumpBufferTimer = 0;
          this._trigger("OnWallJumped");
          this._trigger("OnJumped");
        }
        // Floor / coyote / multi-jump
        else if (this._onFloor || this._coyoteTimer > 0 || this._jumpsRemaining > 0) {
          const jumpIndex = this._maxJumps - this._jumpsRemaining + 1;
          this._jumpsRemaining = Math.max(0, this._jumpsRemaining - 1);
          currentVy = -this._jumpStrength;
          jumped = true;
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
      if (this._onCeiling && currentVy < 0) {
        currentVy = 0;
      }

      // ── GRAVITY ─────────────────────────────────────────────────────────
      if (this._gravity !== 0) {
        currentVy += this._gravity * dt;
      }

      // ── WALL SLIDE ──────────────────────────────────────────────────────
      this._isWallSliding = false;
      if (this._wallSlide && !this._onFloor && currentVy > 0) {
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
          `[GroundForce] floor=${this._onFloor ? 1 : 0}(${this._floorContactCount}) wall=${wallStr} ceil=${this._onCeiling} | vx=${vx.toFixed(1)} vy=${currentVy.toFixed(1)} | jumps=${this._jumpsRemaining}/${this._maxJumps} coyote=${this._coyoteTimer.toFixed(3)} buf=${this._jumpBufferTimer.toFixed(3)} air=${this._airTime.toFixed(2)}s | slide=${this._isWallSliding} facing=${facingStr}`
        );
      }

      // ── CLEAR PER-TICK INPUT ────────────────────────────────────────────
      this._inputX = 0;
      this._jumpInputPressed = false;
      this._jumpInputReleased = false;
      this._stopInputThisTick = false;
    }

    _release() {
      document.removeEventListener("keydown", this._onKeyDown);
      document.removeEventListener("keyup", this._onKeyUp);
      super._release();
    }

    _saveToJson() {
      return {
        maxSpeed: this._maxSpeed,
        acceleration: this._acceleration,
        deceleration: this._deceleration,
        jumpStrength: this._jumpStrength,
        gravity: this._gravity,
        maxFallSpeed: this._maxFallSpeed,
        defaultControls: this._defaultControls,
        slopeTolerance: this._slopeTolerance,
        coyoteTime: this._coyoteTime,
        jumpBuffer: this._jumpBuffer,
        maxJumps: this._maxJumps,
        wallSlide: this._wallSlide,
        wallSlideSpeed: this._wallSlideSpeed,
        wallJump: this._wallJump,
        wallJumpStrength: this._wallJumpStrength,
        variableJump: this._variableJump,
        jumpReleaseDamping: this._jumpReleaseDamping,
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
      };
    }

    _loadFromJson(o) {
      this._maxSpeed = o.maxSpeed;
      this._acceleration = o.acceleration;
      this._deceleration = o.deceleration;
      this._jumpStrength = o.jumpStrength;
      this._gravity = o.gravity;
      this._maxFallSpeed = o.maxFallSpeed;
      this._defaultControls = o.defaultControls;
      this._slopeTolerance = o.slopeTolerance;
      this._coyoteTime = o.coyoteTime;
      this._jumpBuffer = o.jumpBuffer;
      this._maxJumps = o.maxJumps;
      this._wallSlide = o.wallSlide;
      this._wallSlideSpeed = o.wallSlideSpeed;
      this._wallJump = o.wallJump;
      this._wallJumpStrength = o.wallJumpStrength;
      this._variableJump = o.variableJump;
      this._jumpReleaseDamping = o.jumpReleaseDamping ?? 0.5;
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
    }

    _getDebuggerProperties() {
      const vx = this._phys ? this._phys.getVelocity()[0] : 0;
      const vy = this._phys ? this._phys.getVelocity()[1] : 0;
      const speed = Math.sqrt(vx * vx + vy * vy);

      return [
        {
          title: "$Platformer Physics",
          properties: [
            { name: "$Enabled", value: this._enabled },
            { name: "$On floor", value: this._onFloor },
            { name: "$On ceiling", value: this._onCeiling },
            { name: "$On wall (L)", value: this._onWallLeft },
            { name: "$On wall (R)", value: this._onWallRight },
            { name: "$Wall sliding", value: this._isWallSliding },
            { name: "$Facing", value: this._facing === 1 ? "Right" : "Left" },
          ],
        },
        {
          title: "$Velocity",
          properties: [
            { name: "$Speed", value: Math.round(speed * 100) / 100 },
            { name: "$Vector X", value: Math.round(vx * 100) / 100 },
            { name: "$Vector Y", value: Math.round(vy * 100) / 100 },
            { name: "$Max speed", value: this._maxSpeed },
            { name: "$Max fall speed", value: this._maxFallSpeed },
          ],
        },
        {
          title: "$Jumping",
          properties: [
            { name: "$Jump strength", value: this._jumpStrength },
            { name: "$Jumps remaining", value: this._jumpsRemaining },
            { name: "$Max jumps", value: this._maxJumps },
            { name: "$Coyote timer", value: Math.round(this._coyoteTimer * 1000) / 1000 },
            { name: "$Jump buffer", value: Math.round(this._jumpBufferTimer * 1000) / 1000 },
            { name: "$Air time", value: Math.round(this._airTime * 100) / 100 },
            { name: "$Variable jump", value: this._variableJump },
            { name: "$Release damping", value: Math.round(this._jumpReleaseDamping * 100) + "%" },
          ],
        },
        {
          title: "$Movement Config",
          properties: [
            { name: "$Acceleration", value: this._acceleration },
            { name: "$Deceleration", value: this._deceleration },
            { name: "$Gravity", value: this._gravity },
            { name: "$Ignore input", value: this._ignoreInput },
            { name: "$Default controls", value: this._defaultControls },
            { name: "$Freeze X", value: this._freezeX },
            { name: "$Freeze Y", value: this._freezeY },
          ],
        },
        {
          title: "$Wall Interaction",
          properties: [
            { name: "$Wall slide", value: this._wallSlide },
            { name: "$Wall slide speed", value: this._wallSlideSpeed },
            { name: "$Wall jump", value: this._wallJump },
            { name: "$Wall jump strength", value: this._wallJumpStrength },
            { name: "$Wall contact side", value: this._wallContactSide === -1 ? "Left" : this._wallContactSide === 1 ? "Right" : "None" },
          ],
        },
      ];
    }
  };
}
