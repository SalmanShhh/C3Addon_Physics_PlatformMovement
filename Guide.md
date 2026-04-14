# Platformer Physics - Complete Guide

**Platformer Physics** is a Construct 3 behavior that replicates the full ACE surface of the built-in Platform behavior — same property names, same action signatures, same conditions and expressions — while driving all movement through the built-in **Physics** behavior. The character becomes a real rigid body: it pushes crates, rides moving platforms, reacts to explosions, and interacts with joints, all while feeling like a standard Platform-behavior character to event sheet developers. Swapping from the built-in Platform behavior to Platformer Physics requires only changing the behavior reference — no ACE rewiring.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Project Setup](#2-project-setup)
3. [Behavior Properties](#3-behavior-properties)
4. [Movement](#4-movement)
5. [Jumping](#5-jumping)
6. [Wall Slide & Wall Jump](#6-wall-slide--wall-jump)
7. [Coyote Time & Jump Buffer](#7-coyote-time--jump-buffer)
8. [Contact Classification](#8-contact-classification)
9. [Gravity & Fall Speed](#9-gravity--fall-speed)
10. [Axis Freezing](#10-axis-freezing)
11. [Actions Reference](#11-actions-reference)
12. [Conditions Reference](#12-conditions-reference)
13. [Expressions Reference](#13-expressions-reference)
14. [Triggers Reference](#14-triggers-reference)
15. [Game Use Cases](#15-game-use-cases)
16. [C3 Debugger](#16-c3-debugger)
17. [Save & Load](#17-save--load)
18. [Tips and Common Mistakes](#18-tips-and-common-mistakes)
19. [Scripting Interface](#19-scripting-interface)

---

## 1. Core Concepts

### The problem Platformer Physics solves

The built-in Platform behavior in Construct 3 uses its own internal kinematic solver. It does not interact with the Physics simulation at all. If you want your platformer character to push Physics objects, ride moving Physics platforms, get knocked back by Physics explosions, or participate in joint constraints, you must write extensive workaround events — and even then, the results are fragile and inconsistent.

Platformer Physics replaces the kinematic solver with the Physics engine while preserving the exact same event sheet interface. You configure **Max Speed**, **Acceleration**, **Jump Strength**, and all the same properties you already know. You call `SimulateControl`, `SetVectorX`, `IsOnFloor`, and all the same ACEs. But under the hood, every velocity change goes through `setVelocity()` on the Physics behavior, and every floor/wall/ceiling check reads Physics contact points. The character is a real rigid body in the Physics world.

---

### Key design decisions

**Physics behavior is required.** The object must have both the Platformer Physics behavior and the built-in Physics behavior attached. If Physics is missing, the behavior logs a warning and disables itself.

**Platformer Physics does not own Physics world gravity.** The `Gravity` property applies an *additional* per-instance downward acceleration on top of whatever the Physics world gravity is doing. This means you can use Physics world gravity alone, Platformer Physics gravity alone, or both combined — see §9.

**Platformer Physics does not render anything.** Sprite animation (run, jump, fall, wall-slide frames) and horizontal flipping are the developer's responsibility. Use the `OnFacingChanged` trigger and `IsFalling`/`IsJumping` conditions to drive animation state.

**Contact classification is geometric, not normal-based.** The built-in Platform behavior uses collision normals from C3's internal engine. Platformer Physics cannot access those — it classifies contacts by comparing contact point positions to the instance bounding box. See §8.

---

### Key concepts at a glance

| Concept | What it means |
|---|---|
| **Physics sibling** | The built-in Physics behavior on the same object. Platformer Physics finds it automatically via `behaviorType.name === "Physics"`. |
| **Contact classification** | Each Physics contact point is classified as floor, ceiling, or wall based on its position relative to the instance center. |
| **Acceleration model** | Horizontal speed ramps toward Max Speed by Acceleration per second, and decays toward zero by Deceleration per second — matching the built-in Platform behavior exactly. |
| **Coyote time** | A grace window after leaving a ledge during which the character can still jump. |
| **Jump buffer** | A grace window that remembers a jump press before landing, firing it automatically on the next landing tick. |
| **SimulateControl** | The same action as the built-in Platform behavior. Feed directional and jump inputs programmatically instead of (or alongside) keyboard controls. |

---

### Scenarios where Platformer Physics excels

**Classic 2D side-scroller** — Drop-in replacement for the built-in Platform behavior. The player character gains Physics interaction with tumbling barrels, swinging crates, and breakable terrain at zero extra event-sheet cost.

**Metroidvania with physics puzzles** — Wall jump and double jump are unlockable upgrades. Call `SetMaxJumps(2)` and `SetWallJump(true)` when the player acquires abilities. The character simultaneously interacts with Physics puzzles as a real rigid body.

**Multiplayer brawler** — Each fighter has its own Platformer Physics instance with isolated velocity, jump count, and coyote state. Fighters can physically collide with and push each other through Physics, while each responds to its own player input via `SimulateControl`.

**Platformer with AI enemies** — AI controllers call `SimulateControl(Left)`, `SimulateControl(Right)`, and `SimulateControl(Jump)` every tick, identical to how the player's input feeds the behavior. No separate movement system needed.

**Procedural trap room** — Explosions call `SetVectorY(-800)` to launch the character. The arc is Physics-real. Platformer Physics resumes normal control on `OnLanded`.

**Mobile game with touch controls** — On-screen buttons call `SimulateControl` on press/release, identical to the built-in Platform behavior's touch workflow. Default controls are disabled.

**Rhythm platformer** — `SetIgnoreInput(true)` during scripted sequences locks movement while a cutscene plays. The character stands still on Physics ground as a proper rigid body — no flickering or drift.

---

## 2. Project Setup

### Step 1 — Create your object

Create a Sprite (or any world object) for your character. Give it a Physics-compatible collision shape — a convex capsule or box works best.

### Step 2 — Add behaviors

Add **two** behaviors to the object:

1. **Physics** (built-in)
2. **Platformer Physics** (this addon)

### Step 3 — Configure Physics properties

Set these Physics behavior properties for platformer-feel:

| Physics Property | Recommended Value | Why |
|---|---|---|
| Prevent Rotation | `Yes` | Stops the character from spinning on impact |
| Friction | `0` | Lets Platformer Physics own horizontal velocity |
| Linear Damping | `0` | Damping fights the acceleration model |
| Is Bullet | `Yes` (for fast characters) | Prevents tunneling at high speed |
| Density | `0.1 – 0.5` | Tune how much the character pushes Physics objects |
| Is Immovable | `No` | Character must be movable for interaction to work |

### Step 4 — Configure Platformer Physics properties

Set the behavior properties in the Properties Bar (see §3 for full list). The defaults are tuned for a standard platformer feel.

### Step 5 — First working example

```
Event: Keyboard "Right arrow" is down
  Action: PlatformerPhysics -> Simulate control "Right"

Event: Keyboard "Left arrow" is down
  Action: PlatformerPhysics -> Simulate control "Left"

Event: Keyboard "Space" on pressed
  Action: PlatformerPhysics -> Simulate control "Jump"

Event: Keyboard "Space" on released
  Action: PlatformerPhysics -> Simulate control "Jump release"
```

### Step 6 — Verify

Place your character sprite above a Physics-enabled static platform. Press Play. The character should run, jump, and land using Physics.

Event: Keyboard "Space" on released
  Action: PlatformerPhysics -> Simulate control "Jump release"
```

### Step 6 — Verify

Place your character sprite above a Physics-enabled static platform. Press Play. The character should run, jump, and land using Physics. No Keyboard object is required — default controls use DOM key events directly.

---

## 3. Behavior Properties

Configure these in the Properties Bar when the object is selected.

| Property | Type | Default | Description |
|---|---|---|---|
| **Max Speed** | Float | `200` | Maximum horizontal movement speed in px/s. |
| **Acceleration** | Float | `1500` | Rate at which horizontal velocity increases toward Max Speed (px/s²). |
| **Deceleration** | Float | `1500` | Rate at which horizontal velocity decreases to zero when no input is given (px/s²). |
| **Jump Strength** | Float | `600` | Upward impulse magnitude applied when a jump executes (px/s). |
| **Gravity** | Float | `0` | Additional downward acceleration (px/s²) on top of Physics world gravity. |
| **Max Fall Speed** | Float | `1000` | Terminal velocity clamp (px/s downward). |
| **Default Controls** | Checkbox | `On` | Read Arrow keys, A/D, and Space/Up/W automatically each tick via DOM key events (no Keyboard object needed). |
| **Slope Tolerance** | Float | `0.35` | Fraction of half-height below center required for a contact to count as floor. Lower = more permissive slopes. |
| **Coyote Time** | Float | `0.1` | Seconds after leaving a ledge during which a jump is still allowed. |
| **Jump Buffer** | Float | `0.1` | Seconds a jump input is remembered before landing. |
| **Max Jumps** | Integer | `1` | Total jumps per airborne period. 1 = single, 2 = double jump. |
| **Wall Slide** | Checkbox | `Off` | Clamp fall speed when pressing into a wall while airborne. |
| **Wall Slide Speed** | Float | `80` | Maximum downward speed (px/s) while wall sliding. |
| **Wall Jump** | Checkbox | `Off` | Allow jumping off a wall. Pushes away from the wall horizontally. |
| **Wall Jump Strength** | Float | `450` | Horizontal impulse of a wall jump. Vertical uses Jump Strength. |
| **Variable Jump Height** | Checkbox | `On` | Releasing jump early dampens upward velocity for short/tall jump variation. |
| **Debug Mode** | Checkbox | `Off` | Print contact and velocity state to the browser console each tick. |

---

## 4. Movement

### How horizontal movement works

Platformer Physics uses an **acceleration/deceleration model** identical to the built-in Platform behavior. When the player holds a direction:

1. The current horizontal velocity is read from the Physics behavior.
2. It accelerates toward `inputDirection × MaxSpeed` by `Acceleration × dt` per tick.
3. When input is released, it decelerates toward zero by `Deceleration × dt` per tick.
4. The result is clamped to `±MaxSpeed` and written back via `setVelocity()`.

This means `Acceleration = 1500` and `MaxSpeed = 200` takes `200 / 1500 ≈ 0.13 seconds` to reach full speed — matching the built-in Platform behavior exactly.

### SimulateControl

The primary way to feed input. Works identically to the built-in Platform behavior's `Simulate control` action:

```
Event: Touch "Right button" is touching
  Action: PlatformerPhysics -> Simulate control "Right"

Event: Touch "Left button" is touching
  Action: PlatformerPhysics -> Simulate control "Left"

Event: Touch "Jump button" on touched
  Action: PlatformerPhysics -> Simulate control "Jump"

Event: Touch "Jump button" on touch end
  Action: PlatformerPhysics -> Simulate control "Jump release"
```

Multiple `SimulateControl` calls accumulate in the same tick. Calling both `Left` and `Right` cancels out to zero horizontal input — matching the built-in behavior's cancellation model.

### Direct velocity control

Use `SetVectorX` and `SetVectorY` to bypass the acceleration model entirely:

```
// Dash action — instantly set horizontal velocity
Event: Keyboard "Shift" on pressed
  Condition: PlatformerPhysics -> Is facing right
    Action: PlatformerPhysics -> Set vector X to 500
  Condition: PlatformerPhysics -> Is facing right [INVERTED]
    Action: PlatformerPhysics -> Set vector X to -500
```

To set both axes at once, use `Set vector`:

```
// Launch diagonally
Event: Player -> On collision with LaunchPad
  Action: PlatformerPhysics -> Set vector to (400, -600)
```

> **Warning:** `SetVectorY` can overwrite a jump impulse if called in the same tick. Avoid mixing `SetVectorY` with jump inputs on the same tick.

### Stopping

The `Stop` action immediately zeroes both velocity components:

```
Event: Player -> On hit by freeze ray
  Action: PlatformerPhysics -> Stop
```

### Facing direction

The behavior tracks which direction the player last moved. Use this to flip sprites:

```
Trigger: PlatformerPhysics -> On facing changed
  Condition: PlatformerPhysics -> Is facing right
    Action: Sprite -> Set mirrored to false
  Condition: PlatformerPhysics -> Is facing right [INVERTED]
    Action: Sprite -> Set mirrored to true
```

The `FacingDirection` expression returns `-1` (left) or `1` (right).

---

## 5. Jumping

### Basic jump

Feed jump input via `SimulateControl`:

```
Event: Gamepad button 0 on pressed
  Action: PlatformerPhysics -> Simulate control "Jump"

Event: Gamepad button 0 on released
  Action: PlatformerPhysics -> Simulate control "Jump release"
```

### Variable jump height

When **Variable Jump Height** is enabled (default), releasing the jump button early dampens the upward velocity. The default damping is 50% — meaning the character keeps half its upward speed on release. This gives short hops for taps and full-height jumps for holds — essential for precision platformers.

You can tune the damping at runtime with `Set jump release damping`:

```
// Very responsive short hops (only keep 20% of upward speed)
Event: On start of layout
  Action: PlatformerPhysics -> Set jump release damping to 20

// Heavier feel (keep 70% of upward speed)
Event: On start of layout
  Action: PlatformerPhysics -> Set jump release damping to 70
```

The value is a percentage (0–100). Lower values give more height control; higher values make early release less effective.

### Multi-jump (double jump)

Set **Max Jumps** to `2` (or higher) in properties, or at runtime:

```
// Unlock double jump when player picks up upgrade
Event: Player -> On collision with DoubleJumpPickup
  Action: PlatformerPhysics -> Set max jumps to 2
  Action: Destroy DoubleJumpPickup
```

The `OnDoubleJumped` trigger fires on the second (and any subsequent) jump:

```
Trigger: PlatformerPhysics -> On double jumped
  Action: Spawn "DoubleJumpEffect" at Player.X, Player.Y
```

### Reset jumps (bounce pads, springs)

`ResetJumps` restores the full jump count as if the character just landed. Use it for bounce pads or mid-air pickups:

```
Event: Player -> On collision with BouncePad
  Action: PlatformerPhysics -> Set vector Y to -800
  Action: PlatformerPhysics -> Reset jumps
  // Player can double-jump again after being launched
```

### Jump triggers

| Trigger | When it fires |
|---|---|
| `On jumped` | Every jump, including the first |
| `On double jumped` | Every jump after the first (index ≥ 2) |
| `On landed` | First tick of confirmed floor contact after being airborne |
| `On fallen off` | Lost floor contact without jumping (walked off a ledge) |

```
Trigger: PlatformerPhysics -> On landed
  Action: Spawn "LandDust" at Player.X, Player.Y + Player.Height/2
  // AirTime expression is available inside this trigger

Trigger: PlatformerPhysics -> On fallen off
  // Coyote timer just started — player can still jump for CoyoteTime seconds
```

---

## 6. Wall Slide & Wall Jump

### Wall Slide

Enable **Wall Slide** in properties (or at runtime with `SetWallSlide`). When the player presses into a wall while airborne and falling, their fall speed is clamped to **Wall Slide Speed** (default 80 px/s):

```
// Enable wall slide when player acquires the ability
Event: Player -> On collision with WallSlidePickup
  Action: PlatformerPhysics -> Set wall slide to true
```

The `IsWallSliding` condition is true during a wall slide:

```
Event: Every tick
  Condition: PlatformerPhysics -> Is wall sliding
    Action: Sprite -> Set animation to "WallSlide"
```

### Wall Jump

Enable **Wall Jump** in properties (or with `SetWallJump`). When the player presses jump while on a wall and airborne, the character pushes away from the wall:

- Horizontal impulse: `WallJumpStrength` (away from the wall)
- Vertical impulse: `JumpStrength` (upward)
- Velocity is zeroed before the impulse, guaranteeing a consistent arc regardless of current speed

```
Trigger: PlatformerPhysics -> On wall jumped
  Action: Spawn "WallJumpSpark" at Player.X, Player.Y
  // WallContactSide expression: -1 = jumped off left wall, 1 = right wall
```

### Wall contact detection

Use `IsOnWall` to check for wall contact:

```
Condition: PlatformerPhysics -> Is on wall (Left)
Condition: PlatformerPhysics -> Is on wall (Right)
Condition: PlatformerPhysics -> Is on wall (Either)
```

The `WallContactSide` expression returns `-1` (left wall), `1` (right wall), or `0` (no wall).

---

## 7. Coyote Time & Jump Buffer

### Coyote Time

**Coyote Time** (default 0.1 seconds) allows the player to jump for a brief window after walking off a ledge. This makes platforming feel more forgiving — if the player is a few frames late pressing jump, it still works:

```
// Increase coyote time for a more forgiving game
Event: On start of layout
  Action: Set coyote time property to 0.15 in Properties Bar
```

The `OnFallenOff` trigger fires when the player leaves a ledge without jumping. At that moment, the coyote timer starts counting down.

### Jump Buffer

**Jump Buffer** (default 0.1 seconds) remembers a jump press for a short window before the character lands. If the player presses jump while still in the air but about to land, the jump fires automatically on the next landing tick:

```
// Both features work together:
// Player runs off a ledge → coyote timer starts
// Player presses jump 0.05s later → coyote timer still active → jump succeeds

// Player falls toward a platform → presses jump 0.08s before landing
// → jump buffer stores the input → fires jump on landing tick
```

Set either to `0` to disable.

---

## 8. Contact Classification

### How it works

The Physics behavior exposes contact point positions but not contact normals. Platformer Physics classifies each contact geometrically by comparing its position to the instance bounding box:

| Classification | Rule |
|---|---|
| **Floor** | Contact Y > center Y + `SlopeTolerance × halfHeight` |
| **Ceiling** | Contact Y < center Y − `SlopeTolerance × halfHeight` |
| **Wall** | Contact within the floor/ceiling band AND `|contact X − center X| > 0.4 × halfWidth` |

### Slope Tolerance

The **Slope Tolerance** property (default `0.35`) controls how far below the instance center a contact must be to count as floor. Lower values are more permissive on slopes; higher values are stricter.

```
// For smoother slope walking (more contacts count as floor)
Slope Tolerance = 0.2

// For stricter floor detection (steeper slopes register as walls)
Slope Tolerance = 0.5
```

### Limitations

- On steep slopes (> ~45°), contacts may be classified as walls instead of floors
- If the Physics collision shape is much smaller than the sprite bounding box, misclassification can occur
- A convex capsule-style Physics shape gives the best contact distribution

### Best practices

- Ensure the Physics collision shape closely matches the sprite bounding box
- Use a capsule or rounded-rectangle Physics shape for the character
- Test with **Debug Mode** enabled to see contact classifications in the console

---

## 9. Gravity & Fall Speed

### Dual-source gravity model

Platformer Physics applies **additional** downward acceleration on top of Physics world gravity. This gives three approaches:

**Approach 1 — Physics gravity only** (`Gravity = 0`): Use the Physics world gravity panel setting. Simplest setup. All objects fall at the same rate.

```
// In Physics behavior properties or via action:
// Physics world gravity = 10 (default)
// Platformer Physics Gravity = 0
```

**Approach 2 — Platformer Physics gravity only** (`Gravity = 1500`, Physics world gravity = 0): Platformer Physics fully owns falling. Matches the built-in Platform behavior's gravity model exactly.

```
Event: On start of layout
  Action: Physics -> Set world gravity to 0
  Action: PlatformerPhysics -> Set gravity to 1500
```

**Approach 3 — Combined** (both > 0): The character falls faster than other Physics objects. Use for heavy-feeling characters in a world with light Physics gravity.

### Max Fall Speed

The **Max Fall Speed** property (default `1000 px/s`) clamps the downward velocity every tick. This prevents the character from accelerating indefinitely during long falls:

```
// Override at runtime
Event: Player enters water zone
  Action: PlatformerPhysics -> Set max fall speed to 200
  Action: PlatformerPhysics -> Set gravity to 200
  // Slower, floatier movement in water
```

### Ceiling bonk

When the character hits a ceiling (`IsOnCeiling` is true) and has upward velocity, the upward velocity is set to zero. This prevents the character from "sticking" to ceilings during jumps.

---

## 10. Axis Freezing

The **Set freeze axis** action locks movement on the horizontal axis, vertical axis, or both. While an axis is frozen, its velocity is forced to zero every tick — the character cannot move on that axis regardless of input, gravity, or direct velocity calls.

### Freezing an axis

```
// Freeze horizontal movement (character can still jump/fall)
Event: Player enters magnetic field
  Action: PlatformerPhysics -> Set freeze axis Horizontal to true

// Freeze vertical movement (character floats in place but can run)
Event: Player activates levitation
  Action: PlatformerPhysics -> Set freeze axis Vertical to true

// Freeze all movement
Event: Player hit by stasis beam
  Action: PlatformerPhysics -> Set freeze axis Both to true
```

### Unfreezing

```
// Unfreeze horizontal
Event: Player leaves magnetic field
  Action: PlatformerPhysics -> Set freeze axis Horizontal to false

// Unfreeze everything
Event: Stasis wears off
  Action: PlatformerPhysics -> Set freeze axis Both to false
```

### Checking frozen state

Use the `Is axis frozen` condition:

```
Event: Every tick
  Condition: PlatformerPhysics -> Is Horizontal axis frozen
    Action: Player -> Set animation to "Locked"
```

> **Note:** Freezing the vertical axis also prevents gravity from pulling the character down. Unfreeze it to resume normal falling.

---

## 11. Actions Reference

### Movement

| Action | Description |
|---|---|
| **Simulate control** `control` | Feed a movement input this tick: Left, Right, Jump, Jump release, or Stop. Multiple calls accumulate; Left + Right cancel out. |
| **Set vector** `x, y` | Set both horizontal and vertical Physics velocity at once (px/s). Bypasses acceleration. |
| **Set vector X** `value` | Directly set horizontal Physics velocity (px/s). Bypasses acceleration. Positive = right. |
| **Set vector Y** `value` | Directly set vertical Physics velocity (px/s). Bypasses jump system. Negative = up. |
| **Stop** | Zero both velocity components instantly. Movement can resume next tick. |
| **Apply impulse** `vx, vy` | Add an instantaneous velocity impulse to the current Physics velocity (px/s). The behavior's deceleration naturally tapers it off. Does not suppress input. |
| **Apply knockback** `vx, vy, duration` | Set velocity to `(vx, vy)` and suppress all movement input for `duration` seconds. Gravity, wall slide, and max fall speed still apply during knockback. |
| **Set ignore input** `enabled` | When true, all simulated input is ignored. Gravity and physics continue. |
| **Set enabled** `enabled` | Fully enable/disable the behavior. Disabled = stops modifying Physics velocity entirely. |
| **Set freeze axis** `axis, freeze` | Lock Horizontal, Vertical, or Both axes. Frozen axes have velocity forced to zero every tick. |

### Jumping

| Action | Description |
|---|---|
| **Set max jumps** `count` | Set total jumps per airborne period. 1 = single, 2 = double jump. |
| **Reset jumps** | Restore full jump count as if just landed. Use for bounce pads or mid-air pickups. |
| **Set wall jump** `enabled` | Enable/disable wall jumping at runtime. |
| **Set wall slide** `enabled` | Enable/disable wall sliding at runtime. |
| **Set jump release damping** `percent` | Set the percentage (0–100) of upward velocity kept on early jump release. Default 50. |

### Configuration

| Action | Description |
|---|---|
| **Set max speed** `value` | Override Max Speed (px/s) at runtime. |
| **Set acceleration** `value` | Override Acceleration (px/s²) at runtime. |
| **Set deceleration** `value` | Override Deceleration (px/s²) at runtime. |
| **Set jump strength** `value` | Override Jump Strength (px/s) at runtime. |
| **Set gravity** `value` | Override additional gravity (px/s²) at runtime. |
| **Set max fall speed** `value` | Override terminal velocity cap (px/s) at runtime. |

---

## 12. Conditions Reference

| Condition | Description |
|---|---|
| **Is on floor** | True if at least one contact point is classified as floor this tick. Invertible. |
| **Is on ceiling** | True if at least one contact is classified as ceiling. Invertible. |
| **Is on wall** `side` | True if a wall contact exists on the specified side (Left, Right, Either). Invertible. |
| **Is jumping** | True if airborne and moving upward (VectorY < 0). Invertible. |
| **Is falling** | True if airborne and moving downward (VectorY > 0) with no floor contact. Invertible. |
| **Is moving** | True if speed > 0.5 px/s. Invertible. |
| **Can jump** | True if a jump is possible: on floor, within coyote window, or jumps remaining > 0. Invertible. |
| **Is facing right** | True if facing right. Invert for facing left. Invertible. |
| **Is enabled** | True if the behavior is active. Invertible. |
| **Is ignoring input** | True if `SetIgnoreInput` was set to true. Invertible. |
| **Is ability enabled** `ability` | True if the specified ability is currently active. Abilities: Coyote Time, Wall Sliding, Wall Jump, Variable Jump. Invertible. |
| **Is wall sliding** | True if wall slide is active this tick. Invertible. |
| **Compare speed** `op, value` | Compare velocity magnitude against a value. Operators: <, ≤, =, ≥, >. |
| **Compare vector X** `op, value` | Compare horizontal velocity against a value. |
| **Compare vector Y** `op, value` | Compare vertical velocity against a value. Positive = downward. |
| **Is axis frozen** `axis` | True if the specified axis (Horizontal or Vertical) is currently frozen. Invertible. |

---

## 13. Expressions Reference

| Expression | Returns | Description |
|---|---|---|
| `Speed` | number | Velocity magnitude: `√(VectorX² + VectorY²)` in px/s. |
| `MaxSpeed` | number | Current Max Speed setting (px/s). |
| `VectorX` | number | Horizontal Physics velocity (px/s). Positive = right. |
| `VectorY` | number | Vertical Physics velocity (px/s). Positive = down. |
| `JumpStrength` | number | Current Jump Strength setting (px/s). |
| `Gravity` | number | Current additional gravity setting (px/s²). |
| `MaxFallSpeed` | number | Current Max Fall Speed setting (px/s). |
| `Acceleration` | number | Current Acceleration setting (px/s²). |
| `Deceleration` | number | Current Deceleration setting (px/s²). |
| `MovingAngle` | number | Direction of velocity in degrees (0 = right, 90 = down). 0 when stationary. |
| `JumpsRemaining` | number | Jumps left in the current airborne period. Resets on landing. |
| `AirTime` | number | Seconds since last leaving floor contact. 0 while grounded. |
| `FacingDirection` | number | -1 = left, 1 = right. |
| `WallContactSide` | number | -1 = left wall, 1 = right wall, 0 = no wall contact. |

---

## 14. Triggers Reference

| Trigger | Description |
|---|---|
| **On landed** | Fires the first tick the character makes confirmed floor contact after being airborne. `VectorX`, `VectorY`, and `AirTime` are available inside. |
| **On fallen off** | Fires when the character loses floor contact without jumping (walked off a ledge). Coyote timer starts now. |
| **On jumped** | Fires on every jump execution, including the first. `JumpsRemaining` and `VectorY` available inside. |
| **On double jumped** | Fires when any jump beyond the first is consumed (jump index ≥ 2). `JumpsRemaining` available inside. |
| **On wall jumped** | Fires when a wall jump executes. `WallContactSide`, `VectorX`, `VectorY` available inside. |
| **On facing changed** | Fires when horizontal facing direction changes. `FacingDirection` available inside. |

---

## 15. Game Use Cases

---

### Use Case 1 — Basic Platformer (Simplest Setup)

**Scenario:** A player-controlled character that runs and jumps on Physics platforms. Default keyboard controls.

#### Event sheet
```
// Nothing needed! Default controls handle everything.

// Optional: flip sprite based on facing
Trigger: PlatformerPhysics -> On facing changed
  Condition: PlatformerPhysics -> Is facing right
    Action: Player -> Set mirrored to false
  Condition: PlatformerPhysics -> Is facing right [INVERTED]
    Action: Player -> Set mirrored to true
```

---

### Use Case 2 — Touch Controls (Mobile)

**Scenario:** On-screen buttons control a mobile platformer character using `SimulateControl`.

#### Event sheet
```
Event: Touch -> Is touching "BtnLeft"
  Action: PlatformerPhysics -> Simulate control "Left"

Event: Touch -> Is touching "BtnRight"
  Action: PlatformerPhysics -> Simulate control "Right"

Event: Touch -> On tap on "BtnJump"
  Action: PlatformerPhysics -> Simulate control "Jump"

Event: Touch -> On touch end on "BtnJump"
  Action: PlatformerPhysics -> Simulate control "Jump release"
```

---

### Use Case 3 — AI-Controlled Enemy

**Scenario:** An enemy patrols left and right, turning at edges. Uses the same behavior as the player.

#### Event sheet
```
// Patrol logic
Event: Every tick
  Condition: Enemy.PatrolDir = 1
    Action: Enemy.PlatformerPhysics -> Simulate control "Right"
  Condition: Enemy.PatrolDir = -1
    Action: Enemy.PlatformerPhysics -> Simulate control "Left"

// Turn at edges
Trigger: Enemy.PlatformerPhysics -> On fallen off
  Action: Enemy -> Set PatrolDir to Enemy.PatrolDir * -1
  // Enemy walked off a ledge — turn around

// Jump over obstacles
Event: Enemy.PlatformerPhysics -> Is on wall (Either)
  Action: Enemy.PlatformerPhysics -> Simulate control "Jump"
```

---

### Use Case 4 — Unlockable Double Jump

**Scenario:** Player starts with single jump. Picking up an upgrade grants double jump.

#### Event sheet
```
Event: Player -> On collision with DoubleJumpOrb
  Action: PlatformerPhysics -> Set max jumps to 2
  Action: Destroy DoubleJumpOrb
  Action: Show "Double Jump Unlocked!" text

// Visual feedback for double jump
Trigger: PlatformerPhysics -> On double jumped
  Action: Spawn "AirJumpRing" at Player.X, Player.Y
```

---

### Use Case 5 — Explosion Knockback

**Scenario:** An explosion launches the player upward with a physics impulse. Platformer Physics resumes control on landing.

#### Event sheet
```
Event: Explosion -> On created
  // Apply Physics impulse directly — Platformer Physics reads the new velocity
  Action: Player.Physics -> Apply impulse at angle
    -> angle: angle(Explosion.X, Explosion.Y, Player.X, Player.Y)
    -> force: 500

// Or use SetVectorY for a simple upward launch
Event: Player -> On collision with LaunchPad
  Action: PlatformerPhysics -> Set vector Y to -800
  Action: PlatformerPhysics -> Reset jumps
  // Player can still double-jump after being launched

Trigger: PlatformerPhysics -> On landed
  Action: Spawn "LandingDust" at Player.X, Player.Y + 16
```

---

### Use Case 6 — Wall Jump Sequence

**Scenario:** A vertical shaft with walls on both sides. The player wall-jumps between them to ascend.

#### Event sheet
```
Event: On start of layout
  Action: PlatformerPhysics -> Set wall jump to true
  Action: PlatformerPhysics -> Set wall slide to true

// Animate wall slide
Event: Every tick
  Condition: PlatformerPhysics -> Is wall sliding
    Action: Player -> Set animation to "WallSlide"

// Spark effect on wall jump
Trigger: PlatformerPhysics -> On wall jumped
  Action: Spawn "WallSpark" at Player.X, Player.Y
```

---

### Use Case 7 — Cutscene / Ignore Input

**Scenario:** During a dialogue cutscene, the player character stands still and cannot move. After the cutscene, control is returned.

#### Event sheet
```
Event: Trigger zone -> On player enters cutscene area
  Action: PlatformerPhysics -> Set ignore input to true
  Action: PlatformerPhysics -> Stop
  Action: Start dialogue sequence

Event: Dialogue -> On complete
  Action: PlatformerPhysics -> Set ignore input to false
```

---

### Use Case 8 — Speed Boost Zone

**Scenario:** Running through a speed zone temporarily doubles the character's max speed and acceleration.

#### Event sheet
```
Event: Player -> Is overlapping SpeedZone
  Action: PlatformerPhysics -> Set max speed to 400
  Action: PlatformerPhysics -> Set acceleration to 3000

Event: Player -> Is NOT overlapping SpeedZone
  Action: PlatformerPhysics -> Set max speed to 200
  Action: PlatformerPhysics -> Set acceleration to 1500
```

---

### Use Case 9 — Water Zone (Slow Movement)

**Scenario:** Entering water reduces speed, gravity, and fall speed for a floaty underwater feel.

#### Event sheet
```
Event: Player -> On collision with Water
  Action: PlatformerPhysics -> Set max speed to 100
  Action: PlatformerPhysics -> Set gravity to 200
  Action: PlatformerPhysics -> Set max fall speed to 150
  Action: PlatformerPhysics -> Set jump strength to 400

Event: Player -> On leaving Water
  Action: PlatformerPhysics -> Set max speed to 200
  Action: PlatformerPhysics -> Set gravity to 1500
  Action: PlatformerPhysics -> Set max fall speed to 1000
  Action: PlatformerPhysics -> Set jump strength to 600
```

---

### Use Case 10 — Freeze Ray Hit

**Scenario:** When hit by a freeze ray, the player stops instantly and cannot move for 2 seconds.

#### Event sheet
```
Event: Player -> On collision with FreezeRay
  Action: PlatformerPhysics -> Stop
  Action: PlatformerPhysics -> Set ignore input to true
  Action: Player -> Set animation to "Frozen"
  Action: Wait 2 seconds

  // After 2 seconds
  Action: PlatformerPhysics -> Set ignore input to false
  Action: Player -> Set animation to "Idle"
```

---

### Use Case 11 — Landing Impact Animation

**Scenario:** Play a different landing animation based on how long the character was airborne.

#### Event sheet
```
Trigger: PlatformerPhysics -> On landed
  Condition: PlatformerPhysics.AirTime > 1.0
    Action: Player -> Set animation to "HardLand"
    Action: Camera -> Shake 0.2s
  Condition: PlatformerPhysics.AirTime ≤ 1.0
    Action: Player -> Set animation to "SoftLand"
```

---

### Use Case 12 — Pushing Physics Crates

**Scenario:** The player character pushes Physics crates by running into them. No extra events needed — Physics handles it automatically.

#### Event sheet
```
// No movement events needed! The player's Physics body pushes crates naturally.

// Optional: play push animation when moving slowly against a wall
Event: Every tick
  Condition: PlatformerPhysics -> Is on wall (Either)
  Condition: PlatformerPhysics -> Is on floor
  Condition: PlatformerPhysics -> Is moving
    Action: Player -> Set animation to "Push"
```

---

### Use Case 13 — Disable Behavior on Death

**Scenario:** When the player dies, disable the behavior so the ragdoll Physics takes over.

#### Event sheet
```
Event: Player -> On collision with Spikes
  Action: PlatformerPhysics -> Set enabled to false
  // Physics behavior still active — character ragdolls naturally
  Action: Player.Physics -> Apply impulse upward at -300
  Action: Wait 2 seconds
  Action: Restart layout
```

---

### Use Case 14 — Debug HUD

**Scenario:** Display all behavior state in a debug text object during development.

#### Event sheet
```
Event: Every tick
  Action: Set DebugText to
    "Floor: " & PlatformerPhysics.IsOnFloor
    & " | Wall: " & PlatformerPhysics.WallContactSide
    & " | VX: " & round(PlatformerPhysics.VectorX)
    & " | VY: " & round(PlatformerPhysics.VectorY)
    & " | Speed: " & round(PlatformerPhysics.Speed)
    & " | Jumps: " & PlatformerPhysics.JumpsRemaining
    & " | Air: " & round(PlatformerPhysics.AirTime * 100) / 100
    & " | Facing: " & PlatformerPhysics.FacingDirection
    & " | Sliding: " & PlatformerPhysics.IsWallSliding
```

---

### Use Case 15 — Axis Freeze for Moving Platforms

**Scenario:** The player lands on a vertically moving platform. Freeze the Y axis so the platform carries them without the behavior fighting the velocity.

#### Event sheet
```
Event: Player -> Is overlapping VerticalPlatform
  Condition: PlatformerPhysics -> Is on floor
    Action: PlatformerPhysics -> Set freeze axis Vertical to true

Event: Player -> Is NOT overlapping VerticalPlatform
  Action: PlatformerPhysics -> Set freeze axis Vertical to false
```

---

### Use Case 16 — Rail Grind (Horizontal Lock)

**Scenario:** The player grinds along a rail, unable to change horizontal speed. Only jumping is allowed.

#### Event sheet
```
Event: Player -> On collision with Rail
  Action: PlatformerPhysics -> Set vector X to 300
  Action: PlatformerPhysics -> Set freeze axis Horizontal to true
  Action: Player -> Set animation to "Grind"

Event: Player -> On leaving Rail
  Action: PlatformerPhysics -> Set freeze axis Horizontal to false
  Action: Player -> Set animation to "Idle"
```

---

### Use Case 17 — Stasis Trap (Full Freeze)

**Scenario:** A trap freezes the player completely for a duration. Unlike `Set ignore input`, this also prevents gravity and external forces from moving them.

#### Event sheet
```
Event: Player -> On collision with StasisTrap
  Action: PlatformerPhysics -> Stop
  Action: PlatformerPhysics -> Set freeze axis Both to true
  Action: Player -> Set animation to "Frozen"
  Action: Wait 3 seconds
  Action: PlatformerPhysics -> Set freeze axis Both to false
  Action: Player -> Set animation to "Idle"
```

---

### Use Case 18 — Tuning Variable Jump Height

**Scenario:** Different characters or power-ups change how responsive the jump feels on release.

#### Event sheet
```
// Nimble character: very responsive short hops
Event: On start of layout
  Condition: PlayerClass = "Scout"
    Action: PlatformerPhysics -> Set jump release damping to 20

// Heavy character: jump release barely matters
Event: On start of layout
  Condition: PlayerClass = "Tank"
    Action: PlatformerPhysics -> Set jump release damping to 80
```

---

### Use Case 19 — Diagonal Launch Pad

**Scenario:** A launch pad sends the player diagonally using `Set vector` to set both axes at once.

#### Event sheet
```
Event: Player -> On collision with DiagonalPad
  Action: PlatformerPhysics -> Set vector to (350, -700)
  Action: PlatformerPhysics -> Reset jumps
  Action: Spawn "LaunchTrail" at Player.X, Player.Y
```

---

### Use Case 20 — Ice Physics (Low Deceleration)

**Scenario:** Walking on ice reduces deceleration so the player slides when releasing input.

#### Event sheet
```
Event: Player -> Is overlapping IceZone
  Action: PlatformerPhysics -> Set deceleration to 200

Event: Player -> Is NOT overlapping IceZone
  Action: PlatformerPhysics -> Set deceleration to 1500
```

---

## 16. C3 Debugger

When **Debug Mode** is enabled, Platformer Physics logs a structured summary to the browser console each tick:

```
[GroundForce] floor=1(2) wall=none ceil=false | vx=198.3 vy=-142.6 | jumps=0/2 coyote=0.000 buf=0.000 air=0.31s | slide=false facing=R
```

### Console output fields

| Field | Meaning |
|---|---|
| `floor=1(2)` | On floor (1 = true), 2 floor contact points |
| `wall=L/R/none` | Wall contact side |
| `ceil=true/false` | Ceiling contact |
| `vx` / `vy` | Current velocity components |
| `jumps=0/2` | Jumps remaining / max jumps |
| `coyote` | Coyote timer value |
| `buf` | Jump buffer timer value |
| `air` | Seconds airborne |
| `slide` | Wall sliding active |
| `facing=R/L` | Current facing direction |

### How to open the console

Press **F12** in the browser to open Developer Tools, then switch to the **Console** tab. Filter by `[GroundForce]` to see only behavior output.

---

## 17. Save & Load

Platformer Physics fully supports Construct 3's savegame system. All runtime state is serialized:

- Configuration overrides (max speed, acceleration, gravity, etc.)
- Contact state (on floor, wall contact side, etc.)
- Timer values (coyote timer, jump buffer, air time, knockback timer)
- Jump state (jumps remaining)
- Input state (ignore input, enabled)
- Facing direction
- Jump release damping
- Axis freeze state (frozen X, frozen Y)

No extra events are needed — `_saveToJson` and `_loadFromJson` handle everything automatically.

---

## 18. Tips and Common Mistakes

- **Physics behavior is mandatory.** If the object doesn't have a Physics behavior, Platformer Physics disables itself and logs a warning. Check the console if nothing is working.

- **Set Physics friction to 0.** Non-zero friction fights the acceleration model and causes sluggish, inconsistent movement. Let Platformer Physics own horizontal velocity entirely.

- **Set Physics linear damping to 0.** Damping counteracts the acceleration and deceleration curves, making the character feel "floaty" in ways the properties can't compensate for.

- **Set Prevent Rotation to true.** Without this, the character capsule spins on impact, causing erratic behavior and visual glitches.

- **Don't mix `SetVectorY` with jump inputs on the same tick.** `SetVectorY` runs after the jump impulse and will overwrite it.

- **Steep slopes may misclassify as walls.** If the character gets stuck on slopes steeper than ~45°, reduce **Slope Tolerance** (e.g. from 0.35 to 0.2) to be more permissive about what counts as floor.

- **The Physics collision shape matters.** Use a convex capsule or rounded rectangle for the character. A simple box can catch on platform edges; a circle can slide off slopes. The collision shape directly affects contact point positions, which drive floor/wall/ceiling detection.

- **`SimulateControl("Stop")` is different from the `Stop` action.** `SimulateControl("Stop")` sets a flag that zeroes velocity during the tick processing. The `Stop` action immediately zeroes velocity via `setVelocity(0, 0)`. Use `Stop` for instant halts; use `SimulateControl("Stop")` to integrate with the tick pipeline.

- **Gravity property is additive.** It stacks on top of Physics world gravity. If you set both to non-zero values, the character falls faster than other Physics objects. Set one or the other to zero unless you deliberately want heavier-feeling characters.

---

## 19. Scripting Interface

Platformer Physics exposes a full public method API callable from **C3 Script events** or any `.js` project file. Every action ACE has a matching method you can call directly on the behavior instance, no event sheet required.

### Accessing the behavior from script

```js
// Get the behavior instance (name must match what the user assigned in the project)
const beh = playerInst.behaviors.PlatformerPhysics;
```

> The key `PlatformerPhysics` is whatever the behavior is named in the project's Properties Bar. If the user renamed it, use that name instead.

---

### Configuration methods

```js
beh.setMaxSpeed(300);          // top running speed in px/s
beh.setAcceleration(2000);     // acceleration in px/s²
beh.setDeceleration(2000);     // deceleration in px/s²
beh.setJumpStrength(700);      // jump impulse in px/s
beh.setGravity(1200);          // extra downward gravity in px/s²
beh.setMaxFallSpeed(1200);     // terminal falling speed in px/s
```

---

### Jumping methods

```js
beh.resetJumps();               // restore all jumps as if just landed
beh.setMaxJumps(2);             // 1 = single, 2 = double, etc.
beh.setJumpReleaseDamping(30);  // 0–100: % of upward velocity kept on early release
beh.setWallJump(true);          // enable wall jumping
beh.setWallSlide(true);         // enable wall sliding
```

---

### Movement methods

```js
beh.setEnabled(false);          // disable the entire behavior
beh.setIgnoreInput(true);       // suppress SimulateControl input
beh.setFreezeAxis(0, true);     // 0 = Horizontal, 1 = Vertical, 2 = Both
beh.setVelocity(150, 0);          // set both velocity components (px/s)
beh.setVectorX(150);            // set X only, Y unchanged
beh.setVectorY(-500);           // set Y only, X unchanged (negative = up)
beh.stop();                     // zero both velocity components instantly
```

#### Simulate controls from script

You can pass either a **string** or a **numeric index**. Strings are case-insensitive and ignore spaces, hyphens, and underscores:

| String (any case/format) | Index | Control |
|---|---|---|
| `"left"` | `0` | Left |
| `"right"` | `1` | Right |
| `"jump"` | `2` | Jump |
| `"jumprelease"` / `"jump_release"` / `"Jump Release"` | `3` | Jump release |
| `"stop"` | `4` | Stop |

```js
// String-based (recommended for scripts — readable)
beh.simulateControl("right");        // move right
beh.simulateControl("Jump");         // jump
beh.simulateControl("Jump Release"); // early release
beh.simulateControl("jump_release"); // same as above

// Index-based (same as ACE combo values)
beh.simulateControl(2);  // jump
```

> **Auto-release:** if you call `simulateControl("jump")` (or index `2`) every tick and then stop, the jump-release fires automatically on the next tick. This mirrors how keyboard edge-detection works and means variable jump height works correctly with scripted input.

---

### Knockback methods

#### `applyImpulse(vx, vy)` - additive impulse

Adds to the current Physics velocity. The behavior's deceleration naturally tapers it off. Use when you want the character to retain some control (e.g. hit while running):

```js
// Hit from the right — shove the character left
beh.applyImpulse(-300, -100);
```

The character can still move and jump; the extra velocity bleeds off over the next few frames.

#### `knockback(vx, vy, duration)` - full knockback with input lock

Sets velocity directly and suppresses all horizontal movement input and jumping for `duration` seconds. Gravity, wall slide, and max fall speed still apply during the window — the character arcs naturally:

```js
// Hard knockback left-and-up, locks input for 0.5 seconds
beh.knockback(-400, -200, 0.5);
```

After `duration` expires, normal control resumes automatically. No cleanup event needed.

**Choosing between the two:**

| | `applyImpulse` | `knockback` |
|---|---|---|
| Velocity effect | Additive | Replaces current velocity |
| Input during effect | Normal (player retains control) | Suppressed for `duration` |
| Use for | Light hits, recoil, small bumps | Enemy attacks, hazards, launch pads |

---

### Read-only state from script

Expressions are not directly callable from script. Use these pattern to read state:

```js
// Via Physics behavior (always available)
const vx = playerInst.behaviors.Physics.getVelocityX();
const vy = playerInst.behaviors.Physics.getVelocityY();
```

For behavior-specific state, the following read-only getters are available directly:

```js
// Ability state — no () needed, these are get properties
beh.isCoyoteTimeEnabled    // true when coyoteTime > 0
beh.isWallSlidingEnabled   // true when wall sliding is on
beh.isWallJumpEnabled      // true when wall jumping is on
beh.isVariableJumpEnabled  // true when variable jump height is on
```

Other conditions (`IsOnFloor`, `IsJumping`, etc.) are exposed via `expose: true` on their ACE and callable from script if your C3 version supports behavior method access.

---

### Full script example - enemy hit response

```js
// In a Script event triggered when the player takes a hit:
runtime.addEventListener("tick", () => {
  // (Better practice: use a dedicated event sheet trigger)
});

// Typical usage in a Script event:
function onPlayerHit(playerInst, hitDirection) {
  const beh = playerInst.behaviors.PlatformerPhysics;

  // Light hit — player keeps some control
  if (hitStrength === "light") {
    beh.applyImpulse(hitDirection * -200, -80);
  }

  // Heavy hit — full knockback, brief input lock
  if (hitStrength === "heavy") {
    beh.knockback(hitDirection * -450, -250, 0.4);
  }
}
```

### Full script example - dynamic difficulty scaling

```js
function applyDifficultySettings(playerInst, difficulty) {
  const beh = playerInst.behaviors.PlatformerPhysics;
  if (difficulty === "easy") {
    beh.setMaxSpeed(220);
    beh.setAcceleration(2000);
    beh.setJumpStrength(650);
    beh.setMaxJumps(2);
  } else if (difficulty === "hard") {
    beh.setMaxSpeed(180);
    beh.setAcceleration(1200);
    beh.setJumpStrength(560);
    beh.setMaxJumps(1);
  }
}
```

### Full script example - AI controller

```js
// Every tick: drive AI enemy using simulateControl
function tickEnemy(enemyInst, targetX) {
  const beh = enemyInst.behaviors.PlatformerPhysics;
  const dx  = targetX - enemyInst.x;

  if (dx > 10)       beh.simulateControl("right");
  else if (dx < -10) beh.simulateControl("left");

  // Jump over walls
  if (enemyInst.behaviors.PlatformerPhysics._onWallLeft ||
      enemyInst.behaviors.PlatformerPhysics._onWallRight) {
    beh.simulateControl("jump");  // auto-releases next tick
  }
}
```

---

### Gotchas

- **`_phys` may be null on the very first tick.** All public methods guard against this internally. Calls before the first `_tick` completes are safe — they simply do nothing.
- **`setVector` bypasses `setIgnoreInput`.** Setting `IgnoreInput = true` blocks `simulateControl` and keyboard input, but direct calls like `setVector`, `applyImpulse`, and `knockback` still apply. This is intentional: code-driven overrides should not be blocked by the input suppression flag.
- **`knockback` resets on save/load.** The `knockbackTimer` is saved to JSON, so a knockback mid-flight survives a load correctly.
- **`simulateControl` accepts strings or indexes.** From script, pass a readable string like `"jump"` or `"Jump Release"` — spaces, underscores, and hyphens are ignored when matching. Numeric indexes (0–4) still work and are what the ACE combo dropdown passes internally.
