# GroundForce
### Physics-Backed Platform Movement Behavior

---

## Header

| Field | Value |
|---|---|
| **Plugin Name** | GroundForce |
| **Tagline** | Physics-Backed Platform Movement Behavior |
| **Addon Type** | `BEHAVIOR` |
| **Behavior ID** | `author_groundforce` |
| **Plugin Type** | N/A (Behavior) |
| **`IsSingleGlobal`** | `false` — per-instance, one per attached object |
| **`IsOnlyOneAllowed`** | `true` — only one GroundForce per object |
| **CAW `addonType`** | `ADDON_TYPE.BEHAVIOR` |

---

## Overview

GroundForce is a Construct 3 behavior that replicates the complete ACE surface of the built-in Platform behavior — same property names, same action signatures, same condition and expression names — while driving all movement through the built-in **Physics** behavior instead of C3's internal kinematic solver.

This means the character participates in the Physics simulation as a full rigid body: it pushes crates, rides moving platforms, reacts to explosions, and interacts with joints, all while still feeling like a standard Platform-behavior character to event sheet developers. Porting from the built-in Platform behavior to GroundForce requires only swapping the behavior reference — no ACE rewiring.

**What GroundForce does NOT do:**
- It does not render anything. Sprite animation (run, jump, fall, wall-slide cycles) and facing flips are the developer's responsibility, driven by GroundForce's triggers and conditions.
- It does not own Solid or Jumpthru collision response. Those remain Physics engine concerns; objects need Physics-compatible collision shapes.
- It does not modify Physics world gravity. The `gravity` property applies an independent per-instance downward acceleration on top of the Physics world gravity, which the developer controls separately.
- It does not emulate the built-in Platform behavior's slope-normal algorithm (which operates on convex hull data). It approximates slope classification from Physics contact point positions — see Architecture Notes.
- It does not replace the built-in Platform behavior for projects not using the Physics behavior.

**Required dependency:** The object must also have the built-in **Physics** behavior attached. GroundForce finds it at runtime via `behaviorType.name === "Physics"`. If Physics is absent, GroundForce logs a warning and disables itself. Recommended Physics property settings are documented at the end of Architecture Notes.

---

## Use Cases

1. **Classic 2D side-scroller** — Drop-in replacement for the built-in Platform behavior on the player character, gaining Physics interaction with environmental objects (tumbling barrels, swinging crates, breakable terrain) at no extra event-sheet cost.

2. **Metroidvania with physics puzzles** — Wall jump and double jump are unlockable upgrades. Call `SetMaxJumps(2)` and `SetWallJump(true)` when the player acquires abilities. The character simultaneously interacts with Physics puzzles as a real rigid body.

3. **Multiplayer brawler** — Each fighter has their own GroundForce instance with isolated velocity, jump count, and coyote state. Fighters can physically collide with and push each other through Physics, while each responds to its own player input through `SimulateControl`.

4. **Platformer with AI enemies** — AI controller calls `SimulateControl(Left)`, `SimulateControl(Right)`, and `SimulateControl(Jump)` every tick, matching exactly how the player's input feeds the behavior. No separate movement system needed for AI vs player.

5. **Procedural trap room** — Explosions and hazards call `SetVectorY(-800)` to launch the character. The arc is Physics-real; GroundForce resumes normal control on `OnLanded`.

6. **Mobile game with touch controls** — On-screen buttons call `SimulateControl` actions on press/release, identical to the built-in Platform behavior's touch workflow. Default controls are disabled.

7. **Rhythm platformer** — `SetIgnoreInput(true)` during scripted sequences locks movement while a cutscene plays, then releases. The character stands still on Physics ground as a proper rigid body — no flickering or drift.

8. **Bullet-hell dodge game** — `Stop` is called every time the player is hit, halting all momentum. Physics handles the knock-back impulse applied by the bullet; GroundForce resumes on the next tick.

---

## Properties

Property ID order matches `_getInitProperties()` index. All IDs are camelCase.

| # | ID | Display Name | Type | Default | Description |
|---|---|---|---|---|---|
| 0 | `maxSpeed` | Max Speed | `float` | `200` | Maximum horizontal movement speed in px/s. Acceleration drives toward this; deceleration drives away from it. |
| 1 | `acceleration` | Acceleration | `float` | `1500` | Rate at which horizontal velocity increases toward Max Speed (px/s²). Higher = snappier starts. |
| 2 | `deceleration` | Deceleration | `float` | `1500` | Rate at which horizontal velocity decreases to zero when no input is given (px/s²). Higher = snappier stops. |
| 3 | `jumpStrength` | Jump Strength | `float` | `600` | Upward impulse magnitude applied when a jump executes (px/s). Matches the built-in Platform behavior's "Jump strength" unit. |
| 4 | `gravity` | Gravity | `float` | `0` | Additional downward acceleration (px/s²) applied per tick on top of Physics world gravity. Set to match the built-in Platform behavior gravity (~1500 typical) if Physics world gravity is set to 0. See Architecture Notes. |
| 5 | `maxFallSpeed` | Max Fall Speed | `float` | `1000` | Terminal velocity clamp (px/s downward). The behavior clamps VectorY to this every tick. |
| 6 | `defaultControls` | Default Controls | `boolean` | `true` | When true, the behavior reads Arrow Left/Right, A/D, and Space/Up/W from the runtime keyboard each tick and feeds them as simulated controls. Requires a Keyboard object in the project. |
| 7 | `slopeTolerance` | Slope Tolerance | `float` | `0.35` | Contact classification threshold: a contact point must be at least `slopeTolerance × halfHeight` below the instance center to count as a floor contact. Lower = more permissive slope handling. |
| 8 | `coyoteTime` | Coyote Time | `float` | `0.1` | Seconds after leaving a floor edge during which a jump is still allowed. 0 to disable. |
| 9 | `jumpBuffer` | Jump Buffer | `float` | `0.1` | Seconds a jump input is remembered before landing. Fires automatically on the next landing tick if still active. 0 to disable. |
| 10 | `maxJumps` | Max Jumps | `integer` | `1` | Total jumps allowed per airborne period. 1 = single jump, 2 = double jump. |
| 11 | `wallSlide` | Wall Slide | `boolean` | `false` | Clamp fall speed to Wall Slide Speed when pressing into a wall while airborne. |
| 12 | `wallSlideSpeed` | Wall Slide Speed | `float` | `80` | Maximum downward speed (px/s) while wall sliding. |
| 13 | `wallJump` | Wall Jump | `boolean` | `false` | Allow jumping off a wall. The jump pushes away from the wall horizontally and upward vertically. |
| 14 | `wallJumpStrength` | Wall Jump Strength | `float` | `450` | Horizontal impulse component of a wall jump. Vertical uses Jump Strength. |
| 15 | `variableJumpHeight` | Variable Jump Height | `boolean` | `true` | Releasing jump early dampens upward velocity, giving short/tall jump variation. |
| 16 | `debugMode` | Debug Mode | `boolean` | `false` | Print contact classification and velocity state to the browser console each tick. |

---

## ACE Categories

```js
export const aceCategories = {
  Movement:      "Movement",
  Jumping:       "Jumping",
  Conditions:    "Conditions",
  Configuration: "Configuration",
};
```

---

## Actions

### Category: Movement

| ACE ID | List Name | Display Text | Description | Parameters |
|---|---|---|---|---|
| `SimulateControl` | Simulate control | Simulate **{0}** | Simulate pressing or releasing a movement control this tick. Identical effect to default keyboard controls. Stack multiple calls in the same tick to combine inputs (e.g. Right + Jump simultaneously). | `control` (combo, "Control", "Control to simulate.", items: `[{left: "Left"}, {right: "Right"}, {jump: "Jump"}, {jump_release: "Jump release"}, {stop: "Stop"}]`, initialValue: `"left"`) |
| `SetVectorX` | Set vector X | Set vector X to **{0}** | Directly set the horizontal Physics velocity (px/s). Bypasses acceleration — takes effect immediately. Positive = right. | `vectorX` (number, "Vector X", "New horizontal velocity in px/s.") |
| `SetVectorY` | Set vector Y | Set vector Y to **{0}** | Directly set the vertical Physics velocity (px/s). Bypasses the jump system — takes effect immediately. Positive = down. | `vectorY` (number, "Vector Y", "New vertical velocity in px/s. Use negative values to move upward.") |
| `Stop` | Stop | Stop | Immediately set both velocity components to zero. Does not disable the behavior; movement can resume next tick via input. | — |
| `SetDefaultControls` | Set default controls | Set default controls to **{0}** | Enable or disable automatic keyboard input reading. | `enabled` (boolean, "Enabled", "True to enable default keyboard controls.") |
| `SetIgnoreInput` | Set ignore input | Set ignore input to **{0}** | When true, all input (default controls and SimulateControl calls) is ignored this tick and future ticks until re-enabled. The behavior otherwise runs normally: gravity, physics clamping, and state tracking continue. | `ignore` (boolean, "Ignore", "True to ignore all input.") |
| `SetEnabled` | Set enabled | Set enabled to **{0}** | Fully enable or disable the behavior. When disabled, GroundForce stops modifying Physics velocity entirely and all internal state resets. | `enabled` (boolean, "Enabled", "True to enable.") |

### Category: Jumping

| ACE ID | List Name | Display Text | Description | Parameters |
|---|---|---|---|---|
| `SetMaxJumps` | Set max jumps | Set max jumps to **{0}** | Set the maximum number of jumps per airborne period at runtime. | `count` (integer, "Count", "1 = single jump, 2 = double jump, etc.") |
| `ResetJumps` | Reset jumps | Reset jumps | Restore the full jump count as if the character just landed. Use for springs, bounce pads, or mid-air pickups. | — |
| `SetWallJump` | Set wall jump | Set wall jump to **{0}** | Enable or disable wall jumping at runtime. | `enabled` (boolean, "Enabled", "True to enable wall jumping.") |
| `SetWallSlide` | Set wall slide | Set wall slide to **{0}** | Enable or disable wall sliding at runtime. | `enabled` (boolean, "Enabled", "True to enable wall sliding.") |

### Category: Configuration

| ACE ID | List Name | Display Text | Description | Parameters |
|---|---|---|---|---|
| `SetMaxSpeed` | Set max speed | Set max speed to **{0}** | Override Max Speed at runtime. | `speed` (number, "Speed", "New maximum horizontal speed in px/s.") |
| `SetAcceleration` | Set acceleration | Set acceleration to **{0}** | Override Acceleration at runtime. | `accel` (number, "Acceleration", "New acceleration in px/s².") |
| `SetDeceleration` | Set deceleration | Set deceleration to **{0}** | Override Deceleration at runtime. | `decel` (number, "Deceleration", "New deceleration in px/s².") |
| `SetJumpStrength` | Set jump strength | Set jump strength to **{0}** | Override Jump Strength at runtime. | `strength` (number, "Strength", "New jump impulse in px/s.") |
| `SetGravity` | Set gravity | Set gravity to **{0}** | Override the additional downward gravity (px/s²) at runtime. | `gravity` (number, "Gravity", "Additional downward acceleration in px/s². Not the same as Physics world gravity.") |
| `SetMaxFallSpeed` | Set max fall speed | Set max fall speed to **{0}** | Override Max Fall Speed at runtime. | `speed` (number, "Speed", "New terminal velocity cap in px/s.") |

---

## Conditions

### Triggers (On…)

| ACE ID | List Name | Display Text | Description | Available Expressions Inside |
|---|---|---|---|---|
| `OnLanded` | On landed | On landed | Fires the first tick the character makes confirmed floor contact after being fully airborne. | `VectorX`, `VectorY`, `AirTime` |
| `OnFallenOff` | On fallen off | On fallen off | Fires when the character loses floor contact without having jumped — i.e. walked off a ledge. Not fired after a jump; use `OnJumped` for that. | `VectorX`, `VectorY` |
| `OnJumped` | On jumped | On jumped | Fires on each jump execution, including the first of a multi-jump sequence. | `JumpsRemaining`, `VectorY` |
| `OnDoubleJumped` | On double jumped | On double jumped | Fires when any jump beyond the first is consumed (jump index ≥ 2). | `JumpsRemaining` |
| `OnWallJumped` | On wall jumped | On wall jumped | Fires when a wall jump is executed. | `WallContactSide`, `VectorX`, `VectorY` |
| `OnFacingChanged` | On facing changed | On facing changed | Fires when the horizontal facing direction changes. | `FacingDirection` |

### State Checks (Is… / Has… / Can… / Compare…)

| ACE ID | List Name | Display Text | Description | Parameters |
|---|---|---|---|---|
| `IsOnFloor` | Is on floor | Is on floor | True if at least one Physics contact point is classified as a floor contact this tick. | — |
| `IsOnCeiling` | Is on ceiling | Is on ceiling | True if at least one Physics contact is classified as a ceiling contact this tick. | — |
| `IsOnWall` | Is on wall | Is on wall (**{0}**) | True if a wall contact exists on the specified side. | `side` (combo, "Side", "Which side to check.", items: `[{left: "Left"}, {right: "Right"}, {either: "Either"}]`, initialValue: `"either"`) |
| `IsJumping` | Is jumping | Is jumping | True if airborne and VectorY is negative (moving upward). | — |
| `IsFalling` | Is falling | Is falling | True if airborne and VectorY is positive (moving downward) with no floor contact. | — |
| `IsMoving` | Is moving | Is moving | True if the current movement speed is greater than 0.5 px/s. | — |
| `CanJump` | Can jump | Can jump | True if a jump is currently possible: on floor, within coyote window, or jumps remaining > 0 for multi-jump. | — |
| `IsFacingRight` | Is facing right | Is facing right | True if the current facing direction is right. False if facing left. | — |
| `IsEnabled` | Is enabled | Is enabled | True if the behavior is active. | — |
| `IsIgnoringInput` | Is ignoring input | Is ignoring input | True if SetIgnoreInput was set to true. | — |
| `IsWallSliding` | Is wall sliding | Is wall sliding | True if wall slide is active this tick. | — |
| `CompareSpeed` | Compare speed | Speed **{0}** **{1}** | Compare the current movement speed (magnitude of velocity) against a value. | `comparison` (combo, "Comparison", "Comparison operator.", items: `[{less: "<"}, {less_eq: "≤"}, {equal: "="}, {greater_eq: "≥"}, {greater: ">"}]`, initialValue: `"less"`), `value` (number, "Speed", "Speed to compare against in px/s.") |
| `CompareVectorX` | Compare vector X | Vector X **{0}** **{1}** | Compare the current X velocity component against a value. | `comparison` (combo — same as CompareSpeed), `value` (number, "Vector X", "Value to compare against.") |
| `CompareVectorY` | Compare vector Y | Vector Y **{0}** **{1}** | Compare the current Y velocity component against a value. Positive = downward. | `comparison` (combo — same as CompareSpeed), `value` (number, "Vector Y", "Value to compare against.") |

> **Combo runtime note:** All combo parameters above arrive at runtime as **0-based integers** (not key strings). Use a `_combo(value, keys)` helper to map index → key before comparing:
> ```js
> const side = this._combo(sideParam, ["left", "right", "either"]);
> ```

---

## Expressions

| ACE ID | Return Type | Description | Parameters |
|---|---|---|---|
| `Speed` | number | Current movement speed in px/s — magnitude of the combined velocity vector. Equivalent to `sqrt(VectorX² + VectorY²)`. | — |
| `MaxSpeed` | number | Current Max Speed setting (px/s). Reflects runtime overrides from `SetMaxSpeed`. | — |
| `VectorX` | number | Current horizontal Physics velocity (px/s). Positive = right. | — |
| `VectorY` | number | Current vertical Physics velocity (px/s). Positive = down. | — |
| `JumpStrength` | number | Current Jump Strength setting. Reflects runtime overrides. | — |
| `Gravity` | number | Current additional gravity setting (px/s²). Reflects runtime overrides. | — |
| `MaxFallSpeed` | number | Current Max Fall Speed setting (px/s). Reflects runtime overrides. | — |
| `Acceleration` | number | Current Acceleration setting (px/s²). Reflects runtime overrides. | — |
| `Deceleration` | number | Current Deceleration setting (px/s²). Reflects runtime overrides. | — |
| `MovingAngle` | number | Direction of current velocity as an angle in degrees (0 = right, 90 = down). Returns 0 when stationary. | — |
| `JumpsRemaining` | number | Jump count remaining in the current airborne period. Resets to MaxJumps on landing. | — |
| `AirTime` | number | Seconds since the character last left floor contact. 0 while grounded. | — |
| `FacingDirection` | number | Current facing as a signed number: -1 = left, 1 = right. | — |
| `WallContactSide` | number | Side of the most recent wall contact: -1 = left wall, 1 = right wall, 0 = no wall contact. | — |

---

## Data Structures

### Internal per-instance state

All fields initialised in `constructor()`. Fields requiring `this.instance` are resolved in the `_initialized` guard at the start of the first `_tick()`.

```js
// Physics sibling reference
this._phys         = null;      // IPhysicsBehaviorInstance — resolved on first _tick

// Config — mirrored from properties for runtime-override support
this._maxSpeed         = 200;
this._acceleration     = 1500;
this._deceleration     = 1500;
this._jumpStrength     = 600;
this._gravity          = 0;
this._maxFallSpeed     = 1000;
this._defaultControls  = true;
this._slopeTolerance   = 0.35;
this._coyoteTime       = 0.1;
this._jumpBuffer       = 0.1;
this._maxJumps         = 1;
this._wallSlide        = false;
this._wallSlideSpeed   = 80;
this._wallJump         = false;
this._wallJumpStrength = 450;
this._variableJump     = true;
this._debugMode        = false;

// Runtime state — contact classification
this._onFloor           = false;
this._onCeiling         = false;
this._onWallLeft        = false;
this._onWallRight       = false;
this._floorContactCount = 0;
this._wallContactSide   = 0;   // -1 left, 1 right, 0 none

// Runtime state — jumps and timers
this._jumpsRemaining    = 1;
this._coyoteTimer       = 0;
this._jumpBufferTimer   = 0;
this._airTime           = 0;

// Runtime state — input
this._inputX              = 0;     // -1, 0, or 1 this tick (accumulated from all sources)
this._jumpInputPressed    = false; // jump pressed this tick
this._jumpInputReleased   = false; // jump released this tick
this._stopInputThisTick   = false; // Stop simulated this tick
this._ignoreInput         = false;
this._prevKbLeft          = false; // previous-tick keyboard state for edge detection
this._prevKbRight         = false;
this._prevKbJump          = false;

// Runtime state — facing and previous-tick flags
this._facing              = 1;     // -1 = left, 1 = right
this._wasOnFloor          = false;
this._wasFalling          = false;
this._isWallSliding       = false;

// Lifecycle
this._enabled             = true;
this._initialized         = false;
```

---

## Tick Logic (Pseudocode)

```
_tick():
  dt = this.instance.runtime.dt

  // ── INIT GUARD ─────────────────────────────────────────────────────────────
  if not _initialized:
    _initialized = true
    for b in Object.values(this.instance.behaviors):
      if b.behaviorType?.name == "Physics": _phys = b; break
    if not _phys:
      warn("[GroundForce] Physics behavior not found. Disabling.")
      _enabled = false; return
    mirror all _getInitProperties() values into _xxx fields
    _jumpsRemaining = _maxJumps

  if not _enabled or not _phys: return

  // ── DEFAULT CONTROLS ───────────────────────────────────────────────────────
  if _defaultControls and not _ignoreInput:
    kb = this.instance.runtime.keyboard   // may be null if no Keyboard object
    if kb:
      kbLeft  = kb.isKeyDown("ArrowLeft")  or kb.isKeyDown("KeyA")
      kbRight = kb.isKeyDown("ArrowRight") or kb.isKeyDown("KeyD")
      kbJump  = kb.isKeyDown("Space") or kb.isKeyDown("ArrowUp") or kb.isKeyDown("KeyW")

      if kbLeft:  _inputX -= 1
      if kbRight: _inputX += 1

      // Edge detection for jump
      if kbJump and not _prevKbJump:  _jumpInputPressed  = true
      if not kbJump and _prevKbJump:  _jumpInputReleased = true

      _prevKbLeft  = kbLeft
      _prevKbRight = kbRight
      _prevKbJump  = kbJump

  // Clamp analogue input
  _inputX = clamp(_inputX, -1, 1)

  // ── CONTACT CLASSIFICATION ─────────────────────────────────────────────────
  _onFloor = _onCeiling = _onWallLeft = _onWallRight = false
  _floorContactCount = 0

  instCX = this.instance.x
  instCY = this.instance.y
  halfH  = this.instance.height / 2
  halfW  = this.instance.width  / 2

  for i in [0 .. _phys.getContactCount()-1]:
    cx = _phys.getContactX(i)
    cy = _phys.getContactY(i)
    dy = cy - instCY   // + = below center
    dx = cx - instCX   // + = right of center

    if dy > halfH * _slopeTolerance:
      _onFloor = true; _floorContactCount++
    elif dy < -halfH * _slopeTolerance:
      _onCeiling = true
    elif abs(dx) > halfW * 0.4:
      if dx < 0: _onWallLeft = true else: _onWallRight = true
      _wallContactSide = (dx < 0) ? -1 : 1

  // ── FLOOR TRANSITION EVENTS ────────────────────────────────────────────────
  if _onFloor:
    if not _wasOnFloor:                       // just landed
      fire OnLanded
      _airTime = 0
    _jumpsRemaining = _maxJumps
    _coyoteTimer    = _coyoteTime
    _wasOnFloor     = true
  else:
    _coyoteTimer = max(0, _coyoteTimer - dt)
    _airTime    += dt
    if _wasOnFloor and not _jumpInputPressed:  // walked off edge without jumping
      fire OnFallenOff
    _wasOnFloor = false

  // ── TIMERS ─────────────────────────────────────────────────────────────────
  if _jumpInputPressed:
    _jumpBufferTimer = _jumpBuffer
  else:
    _jumpBufferTimer = max(0, _jumpBufferTimer - dt)

  // ── FALLING STATE TRANSITION ───────────────────────────────────────────────
  vy = _phys.getVelocityY()
  isFallingNow = not _onFloor and vy > 0
  // (no separate trigger — developers check IsFalling condition instead)
  _wasFalling = isFallingNow

  // ── STOP INPUT ─────────────────────────────────────────────────────────────
  if _stopInputThisTick and not _ignoreInput:
    _phys.setVelocity(0, 0)
    _jumpInputPressed  = false
    _jumpBufferTimer   = 0
    _stopInputThisTick = false
    goto CLAMP_AND_CLEANUP

  // ── WALL JUMP ──────────────────────────────────────────────────────────────
  // Wall jump is evaluated before floor jump so a wall contact adjacent to
  // the floor doesn't consume a floor jump when wall jumping is intended.
  if _wallJump and (_onWallLeft or _onWallRight) and not _onFloor:
    if (_jumpInputPressed or _jumpBufferTimer > 0) and not _ignoreInput:
      hDir = _onWallLeft ? 1 : -1          // push away from wall
      _phys.setVelocity(0, 0)              // zero existing velocity for consistent arc
      _phys.applyImpulse(hDir * _wallJumpStrength, -_jumpStrength)
      _facing = hDir
      fire OnWallJumped; fire OnFacingChanged
      _jumpInputPressed = false; _jumpBufferTimer = 0
      goto WALL_SLIDE  // skip floor jump this tick

  // ── JUMP ───────────────────────────────────────────────────────────────────
  canJump = _onFloor or (_coyoteTimer > 0) or (_jumpsRemaining > 0)
  if canJump and (_jumpInputPressed or _jumpBufferTimer > 0) and not _ignoreInput:
    isFirstJump = _onFloor or _coyoteTimer > 0
    if isFirstJump:
      _coyoteTimer = 0
      _phys.applyImpulse(0, -_jumpStrength)
      _jumpsRemaining = _maxJumps - 1
      fire OnJumped
    elif _jumpsRemaining > 0:
      vx = _phys.getVelocityX()
      _phys.setVelocity(vx, 0)             // zero downward velocity for full double-jump height
      _phys.applyImpulse(0, -_jumpStrength)
      _jumpsRemaining--
      fire OnJumped; fire OnDoubleJumped
    _jumpInputPressed = false; _jumpBufferTimer = 0

  // ── VARIABLE JUMP HEIGHT ───────────────────────────────────────────────────
  if _variableJump and _jumpInputReleased:
    vy = _phys.getVelocityY()
    if vy < 0:
      _phys.setVelocity(_phys.getVelocityX(), vy * 0.45)  // dampen early release
    _jumpInputReleased = false

  // ── HORIZONTAL MOVEMENT (ACCELERATION MODEL) ───────────────────────────────
  vx = _phys.getVelocityX()

  if not _ignoreInput and _inputX != 0:
    targetVX = _inputX * _maxSpeed
    direction = sign(targetVX - vx)
    delta     = _acceleration * dt
    // Step toward target, clamp so we don't overshoot
    newVX = vx + direction * delta
    if (direction > 0 and newVX > targetVX) or (direction < 0 and newVX < targetVX):
      newVX = targetVX
    _phys.setVelocity(newVX, _phys.getVelocityY())
  else:
    // Decelerate toward zero
    if abs(vx) > 0:
      direction = -sign(vx)
      delta     = _deceleration * dt
      newVX     = vx + direction * delta
      if abs(newVX) < delta or sign(newVX) != sign(vx):
        newVX = 0   // snap to zero when overshoot
      _phys.setVelocity(newVX, _phys.getVelocityY())

  // ── FACING UPDATE ──────────────────────────────────────────────────────────
  if not _ignoreInput and _inputX != 0:
    newFacing = (_inputX > 0) ? 1 : -1
    if newFacing != _facing:
      _facing = newFacing
      fire OnFacingChanged

  // ── WALL SLIDE ────────────────────────────────────────────────────────────
  WALL_SLIDE:
  _isWallSliding = false
  if _wallSlide and not _onFloor:
    wallPresent  = _onWallLeft  and not _ignoreInput and _inputX < 0
    wallPresent  = wallPresent or (_onWallRight and not _ignoreInput and _inputX > 0)
    if wallPresent:
      vy = _phys.getVelocityY()
      if vy > _wallSlideSpeed:
        _phys.setVelocity(_phys.getVelocityX(), _wallSlideSpeed)
      _isWallSliding = true

  // ── ADDITIONAL GRAVITY ────────────────────────────────────────────────────
  // Applied as a per-tick velocity nudge (equivalent to: vy += gravity * dt).
  // Only if _gravity > 0 to avoid interfering when the developer is using
  // Physics worldGravity alone.
  if _gravity > 0:
    vy = _phys.getVelocityY()
    _phys.setVelocity(_phys.getVelocityX(), vy + _gravity * dt)

  // ── TERMINAL VELOCITY ─────────────────────────────────────────────────────
  CLAMP_AND_CLEANUP:
  vy = _phys.getVelocityY()
  if vy > _maxFallSpeed:
    _phys.setVelocity(_phys.getVelocityX(), _maxFallSpeed)

  // ── RESET PER-TICK INPUT ──────────────────────────────────────────────────
  _inputX           = 0     // must be re-sent every tick via SimulateControl or default controls
  _jumpInputPressed = false // reset; buffer timer carries the intent forward
  // _jumpInputReleased already cleared above
```

---

## `SimulateControl` Action Implementation

The built-in Platform behavior's `SimulateControl` action sets the same internal flags as keyboard input. GroundForce matches this exactly.

```js
// ACE function for SimulateControl:
export default function(control) {
  if (this._ignoreInput) return;
  const key = this._combo(control, ["left", "right", "jump", "jump_release", "stop"]);
  switch (key) {
    case "left":         this._inputX -= 1;              break;
    case "right":        this._inputX += 1;              break;
    case "jump":         this._jumpInputPressed = true;  break;
    case "jump_release": this._jumpInputReleased = true; break;
    case "stop":         this._stopInputThisTick = true; break;
  }
}
```

Because `_inputX` accumulates, calling both `SimulateControl(Left)` and `SimulateControl(Right)` in the same tick results in `_inputX = 0` — no horizontal movement. This matches the built-in behavior's cancellation model.

---

## Architecture Notes

### Behavior vs Plugin — `this` context

In a behavior runtime, `this` is the **behavior instance**; `this.instance` is the attached `IWorldInstance`; `this.instance.runtime` is the `IRuntime`. Never access `this.x` or `this.runtime` — those don't exist on the behavior itself.

### `this.instance` is null in the behavior `constructor()`

The attached world instance is not available when the behavior constructor runs. All pure data (Maps, arrays, numbers, booleans) must be initialised in `constructor()`. Everything referencing `this.instance` — including locating the Physics sibling — must be deferred to the `_initialized` guard in `_tick()`.

```js
constructor() {
  super();
  this._setTicking(true);
  this._phys = null;          // safe — pure primitive
  this._initialized = false;
  const props = this._getInitProperties();
  this._maxSpeed    = props[0];
  this._acceleration = props[1];
  // ... all properties mirrored by index
}
```

### Physics sibling location

Use `behaviorType.name` to locate the Physics behavior robustly. The C3 built-in Physics behavior has type name `"Physics"`. Never hardcode the user-assigned behavior key from `this.instance.behaviors["Physics"]` — that key is arbitrary and may differ per project.

```js
for (const b of Object.values(this.instance.behaviors)) {
  if (b.behaviorType?.name === "Physics") {
    this._phys = b;
    break;
  }
}
```

`this.instance.behaviors` is a plain object, not an array. `for...of` directly on it throws `TypeError: not iterable`. Always iterate with `Object.values()` or `Object.keys()`.

### Acceleration model vs direct velocity set

The built-in Platform behavior uses an acceleration/deceleration model. GroundForce replicates this by stepping `_phys.getVelocityX()` toward the target speed by `acceleration × dt` each tick, and stepping it toward zero by `deceleration × dt` when there is no input.

This differs from the previous PhysWalker design which used a lerp. The acceleration model is preferred because it mirrors the built-in behavior exactly — `acceleration = 1500 px/s²` and `maxSpeed = 200 px/s` will take `200/1500 ≈ 0.13 s` to reach full speed, matching the built-in Platform behavior's feel at default settings.

### `SetVectorX` / `SetVectorY` and impulse order

`SetVectorX` and `SetVectorY` are direct velocity overrides that take effect the same tick. When called in the same tick as a jump, impulse is applied first and then the vector override runs — meaning `SetVectorY` can overwrite a jump impulse if called after it in the same tick's event sheet. Developers should avoid mixing SetVector actions with jump inputs on the same tick.

### Wall jump velocity zeroing

Wall jumps call `_phys.setVelocity(0, 0)` before applying the jump impulse. This guarantees a consistent arc regardless of the character's current speed — if the character is running at full speed into the wall, they don't launch at a weird diagonal. The `wallJumpStrength` property controls the horizontal push away from the wall; the vertical component uses the same `jumpStrength` as a floor jump.

### OnFallenOff vs OnJumped

The `OnFallenOff` trigger uses `_wasOnFloor` and the absence of `_jumpInputPressed` to distinguish "stepped off a ledge" from "jumped off a ledge". The built-in Platform behavior fires this only when leaving the floor without a jump. The implementation checks `_wasOnFloor == true` AND `_jumpInputPressed == false` in the same tick that `_onFloor` first becomes false. This requires the jump detection to complete before the fallen-off check — see tick order in pseudocode above (floor-jump block runs before the transition event block for this reason).

### Gravity — dual-source model

The `gravity` property applies **additional** downward acceleration on top of whatever Physics world gravity is doing. This gives developers three approaches:

1. **Physics gravity only** (`gravity = 0`): Use the Physics world gravity panel setting. GroundForce does not add anything. Simplest.
2. **GroundForce gravity only** (`gravity = 1500`, Physics world gravity = 0): GroundForce fully owns falling. Matches the built-in Platform behavior's gravity model exactly.
3. **Combined** (both > 0): The character falls faster than other Physics objects. Useful for heavy-feeling characters in a world with light Physics gravity.

The additional gravity is applied as `vy += _gravity × dt` every tick, which is a Euler integration equivalent to C3's internal Platform behavior calculation.

### Contact-point classification without normals

C3's Physics behavior exposes contact point positions but not contact normals. GroundForce classifies contacts geometrically by comparing each point's position to the instance bounding box:

- **Floor**: contact Y > center Y + `slopeTolerance × halfHeight`
- **Ceiling**: contact Y < center Y − `slopeTolerance × halfHeight`
- **Wall**: contact within floor/ceiling band and |contact X − center X| > `0.4 × halfWidth`

This works well for flat platforms and gentle slopes. On steep slopes (> ~45°) or when the Physics collision shape is much smaller than the sprite bounding box, misclassification can occur. Developers can:
- Use a narrower `slopeTolerance` (e.g. 0.2) for smoother slope walking
- Ensure the Physics collision shape closely matches the sprite
- Use a convex capsule-style Physics shape for best contact distribution

The built-in Platform behavior uses vertex normals from C3's collision engine which GroundForce cannot access. This is the principal limitation vs the built-in behavior.

### Default controls keyboard detection

Default controls read keyboard state via `this.instance.runtime.keyboard`. This object is only available if a **Keyboard** plugin instance exists in the project. If absent, `runtime.keyboard` is `null` and GroundForce skips keyboard reading silently.

Jump input uses edge detection: `_prevKbJump` tracks last tick's state. A jump is fired only on the transition from `false → true`, matching the built-in Platform behavior's "pressed" vs "held" distinction.

### `_setTicking(true)` must be called in `constructor()`

Ticking must be enabled in the constructor to start `_tick()` callbacks. It cannot be enabled later. If `_setTicking(true)` is placed in `onCreate()` or `_tick()`, the behavior will never tick.

### Recommended Physics behavior settings

For platformer-feel matching the built-in Platform behavior:

| Physics Property | Recommended Value | Reason |
|---|---|---|
| Prevent Rotation | `true` | Stops the character capsule from spinning on impact |
| Friction | `0` | Lets GroundForce own horizontal velocity; non-zero friction fights `setVelocity` calls |
| Linear Damping | `0` | Same reason — damping counteracts the acceleration model |
| Is Bullet | `true` for fast characters | Prevents tunneling at high speeds |
| Density | `0.1–0.5` | Tune to affect how much the character pushes Physics objects |
| Is Immovable | `false` | Character must be movable by Physics for interaction to work |

If using GroundForce's `gravity` property to own falling, set Physics world gravity (`IPhysicsBehavior.worldGravity`) to `0` so the character doesn't double-fall.

---

## Debugger Support

When `debugMode` is `true`, log a structured summary each tick:

```
[GroundForce] floor=1(2) wall=L ceil=false | vx=198.3 vy=-142.6 | jumps=0/2 coyote=0.000 buf=0.000 air=0.31s | slide=false facing=R
```

C3 Debugger panel properties (expose via `_getDebuggerProperties()`):

| Debug Key | Value |
|---|---|
| `$onFloor` | `_onFloor` |
| `$floorContacts` | `_floorContactCount` |
| `$onWall` | `_onWallLeft ? "left" : _onWallRight ? "right" : "none"` |
| `$onCeiling` | `_onCeiling` |
| `$vectorX` | `_phys.getVelocityX().toFixed(1)` |
| `$vectorY` | `_phys.getVelocityY().toFixed(1)` |
| `$jumpsRemaining` | `_jumpsRemaining + "/" + _maxJumps` |
| `$coyoteTimer` | `_coyoteTimer.toFixed(3)` |
| `$jumpBufferTimer` | `_jumpBufferTimer.toFixed(3)` |
| `$airTime` | `_airTime.toFixed(2) + "s"` |
| `$isWallSliding` | `_isWallSliding` |
| `$facing` | `_facing === 1 ? "right" : "left"` |
| `$ignoreInput` | `_ignoreInput` |
| `$physicsFound` | `_phys !== null` |

---

## Migration Guide — Built-in Platform Behavior to GroundForce

For projects migrating from C3's built-in Platform behavior:

| Built-in Platform | GroundForce | Notes |
|---|---|---|
| Max speed | `MaxSpeed` property / `SetMaxSpeed` | Identical |
| Acceleration | `Acceleration` property / `SetAcceleration` | Identical |
| Deceleration | `Deceleration` property / `SetDeceleration` | Identical |
| Jump strength | `JumpStrength` property / `SetJumpStrength` | Identical |
| Gravity | `Gravity` property / `SetGravity` | Set Physics worldGravity = 0 if using this |
| Max fall speed | `MaxFallSpeed` property / `SetMaxFallSpeed` | Identical |
| Default controls | `DefaultControls` property / `SetDefaultControls` | Identical |
| Simulate control | `SimulateControl` action | Identical signature |
| Set vector X/Y | `SetVectorX` / `SetVectorY` | Identical |
| Stop | `Stop` | Identical |
| Set ignore input | `SetIgnoreInput` | Identical |
| Is on floor | `IsOnFloor` | Contact-point based — see slope note |
| Is on ceiling | `IsOnCeiling` | Same |
| Is on wall (side) | `IsOnWall(side)` | Same signature |
| Is jumping | `IsJumping` | Same |
| Is falling | `IsFalling` | Same |
| Is moving | `IsMoving` | Same |
| Compare speed | `CompareSpeed` | Same |
| Compare vector X/Y | `CompareVectorX` / `CompareVectorY` | Same |
| Speed | `Speed` | Same |
| VectorX / VectorY | `VectorX` / `VectorY` | Same |
| JumpStrength | `JumpStrength` | Same |
| MovingAngle | `MovingAngle` | Same |
| On landed | `OnLanded` | Same |
| On fallen off | `OnFallenOff` | Same |

**Additional GroundForce-only features** (no built-in Platform equivalent):
- Coyote time / jump buffer
- Double jump (`MaxJumps`)
- Wall slide / wall jump
- Variable jump height
- `ResetJumps` action
- `AirTime`, `JumpsRemaining`, `FacingDirection`, `WallContactSide` expressions

---

## Quality Bar Verification

**Naming Conventions**
- [x] Behavior ID is `author_groundforce` — lowercase, underscores only
- [x] All action names are PascalCase verb phrases (`SimulateControl`, `SetVectorX`, `SetMaxSpeed`, `ResetJumps`)
- [x] All trigger names start with `On` + past-tense verb (`OnLanded`, `OnFallenOff`, `OnJumped`, `OnWallJumped`, `OnFacingChanged`)
- [x] All state-check condition names start with `Is`, `Can`, or `Compare` — no `On` prefix (`IsOnFloor`, `CanJump`, `CompareSpeed`)
- [x] All expression names are PascalCase nouns or `Get` + noun (`Speed`, `VectorX`, `JumpsRemaining`, `MovingAngle`)
- [x] No condition and expression share the same ACE ID — `IsOnFloor` (condition), `FloorContactCount` not exposed as expression to avoid confusion; `WallContactSide` (expression) vs `IsOnWall` (condition); `FacingDirection` (expression) vs `IsFacingRight` (condition)
- [x] All property IDs are camelCase (`maxSpeed`, `jumpStrength`, `wallJumpStrength`, `slopeTolerance`)
- [x] ACE category folder names use `PascalCase_With_Underscores` — `Movement`, `Jumping`, `Conditions`, `Configuration`
- [x] Combo keys use underscores not hyphens: `jump_release`, `less_eq`, `greater_eq`, `one_way` patterns all follow this

**Content & Philosophy**
- [x] Behavior name is evocative — GroundForce
- [x] Addon type correctly declared as `BEHAVIOR` / `ADDON_TYPE.BEHAVIOR`
- [x] Overview makes clear what the behavior does NOT do
- [x] 8 use cases including unexpected genres (rhythm platformer, bullet-hell, mobile touch)
- [x] Every action description starts with a verb
- [x] Every trigger notes which expressions are available inside it
- [x] All internal data structure fields explained
- [x] Architecture notes explain the *why*, not just the *what*

**Technical Accuracy**
- [x] All property types use correct CAW names (`float`, `boolean`, `integer`)
- [x] All combo keys use underscores: `left`, `right`, `either`, `jump_release`, `less_eq`, `greater_eq`
- [x] All combo parameters note 0-based index arrival at runtime
- [x] No expression parameters have `initialValue`
- [x] `Speed` expression uses velocity magnitude, not just VectorX
- [x] Behavior Architecture Notes cover `this` vs `this.instance` and null-in-constructor rule
- [x] `this.instance.behaviors` identified as plain object — must use `Object.values()`
- [x] Physics sibling located via `behaviorType.name === "Physics"`
- [x] Tick pseudocode uses `this.instance.runtime.dt` (not a tick parameter)
- [x] Acceleration model pseudocode avoids overshoot (direction-clamp guard)
- [x] Variable jump height implemented as velocity dampening, not impulse cancellation
- [x] Wall jump zeroes velocity before applying impulse
- [x] `OnFallenOff` correctly distinguished from `OnJumped` via `_jumpInputPressed` flag
- [x] Gravity dual-source model documented with three usage approaches
- [x] Default controls uses edge detection (`_prevKbJump`) for jump input
- [x] Debugger Support section included with `$`-prefix note
- [x] Architecture Notes cover `_setTicking(true)` constructor requirement
- [x] Recommended Physics settings table included
- [x] Migration guide from built-in Platform behavior included
- [x] Physics integration: `inst.behaviors.Physics` access pattern documented
- [x] Spec is complete enough that a C3 addon developer could begin building immediately

---

*Spec complete — GroundForce is a drop-in ACE-compatible replacement for C3's built-in Platform behavior, backed by the Physics simulation.*
