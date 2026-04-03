# Platformer Physics - Testing Examples

A practical guide for verifying each feature of the Platformer Physics behavior in Construct 3.

---

## Layout Setup

### Required object setup

Create a **Sprite** named `Player` with two behaviors:
1. **Physics** (built-in)
2. **Platformer Physics** (this addon)

Create a **Sprite** named `Platform` with the **Physics** behavior set to **Immovable: true**. This is the ground.

Optionally create a **Text** object named `DebugText` to display expression values during testing.

### Physics behavior properties (on Player)
| Property | Value for testing |
|---|---|
| Prevent Rotation | `Yes` |
| Friction | `0` |
| Linear Damping | `0` |
| Density | `0.5` |
| Is Immovable | `No` |

### Platformer Physics behavior properties (on Player)
| Property | Value for testing |
|---|---|
| Max Speed | `200` |
| Acceleration | `1500` |
| Deceleration | `1500` |
| Jump Strength | `600` |
| Gravity | `1500` |
| Max Fall Speed | `1000` |
| Default Controls | `checked` |
| Slope Tolerance | `0.35` |
| Coyote Time | `0.1` |
| Jump Buffer | `0.1` |
| Max Jumps | `1` |
| Wall Slide | `unchecked` |
| Wall Jump | `unchecked` |
| Variable Jump Height | `checked` |
| Debug Mode | **`checked`** |

### Additional objects required
- **Text** object named `DebugText` (for expression verification)

> **Note:** No Keyboard object is needed. Default controls use DOM key events directly.

### Layout arrangement
Place `Player` above `Platform` with enough space to fall and land. For wall tests, add vertical `Platform` objects on both sides.

---

## Test 1 - Basic Movement (Default Controls)

**Goal:** Verify the character moves left/right and jumps using default keyboard controls.

### Event sheet

```
// No events needed — default controls handle Arrow keys, A/D, Space/Up/W
```

**Expected:**
- Pressing Right Arrow or D moves the character right, accelerating up to 200 px/s
- Pressing Left Arrow or A moves the character left
- Releasing direction keys decelerates the character to a stop
- Pressing Space, Up Arrow, or W makes the character jump
- Character lands on the Physics platform and stops falling

**Expressions to verify in DebugText:**
```
"VX: " & PlatformerPhysics.VectorX
"VY: " & PlatformerPhysics.VectorY
"Speed: " & PlatformerPhysics.Speed
"Floor: " & PlatformerPhysics.IsOnFloor
```

---

## Test 2 - SimulateControl (Custom Input)

**Goal:** Verify SimulateControl works identically to default keyboard controls.

### Event sheet

```
Event: On start of layout
  Action: PlatformerPhysics -> Set default controls to false

Event: Keyboard "Right arrow" is down
  Action: PlatformerPhysics -> Simulate control "Right"

Event: Keyboard "Left arrow" is down
  Action: PlatformerPhysics -> Simulate control "Left"

Event: Keyboard "Space" on key pressed
  Action: PlatformerPhysics -> Simulate control "Jump"

Event: Keyboard "Space" on key released
  Action: PlatformerPhysics -> Simulate control "Jump release"
```

**Expected:**
- Movement feels identical to Test 1 with default controls
- Pressing both Left and Right simultaneously cancels out (character stands still)

---

## Test 3 - Floor Detection (IsOnFloor / OnLanded)

**Goal:** Verify floor contact detection and the OnLanded trigger.

### Event sheet

```
Trigger: PlatformerPhysics -> On landed
  Action: Set DebugText to "LANDED! AirTime=" & PlatformerPhysics.AirTime

Event: Every tick
  Action: Append DebugText with " | Floor=" & PlatformerPhysics.IsOnFloor
```

**Expected:**
- `IsOnFloor` returns true when standing on `Platform`
- `IsOnFloor` returns false when airborne
- `OnLanded` fires exactly once when the character first touches the platform after being airborne
- `AirTime` shows a positive value inside the `OnLanded` trigger

---

## Test 4 - Falling Off a Ledge (OnFallenOff)

**Goal:** Verify `OnFallenOff` fires when walking off a ledge (not jumping).

### Event sheet

```
Trigger: PlatformerPhysics -> On fallen off
  Action: Set DebugText to "FALLEN OFF! VX=" & PlatformerPhysics.VectorX

// Walk off the right edge of the platform
```

**Expected:**
- Walking off the platform edge triggers `OnFallenOff`
- Jumping off does NOT trigger `OnFallenOff` — that fires `OnJumped` instead
- `VectorX` shows the horizontal velocity at the moment of leaving the ledge

---

## Test 5 - Jumping (OnJumped / IsJumping / IsFalling)

**Goal:** Verify jump execution and state conditions.

### Event sheet

```
Trigger: PlatformerPhysics -> On jumped
  Action: Set DebugText to "JUMPED! Remaining=" & PlatformerPhysics.JumpsRemaining

Event: Every tick
  Condition: PlatformerPhysics -> Is jumping
    Action: Set JumpLabel to "JUMPING"
  Condition: PlatformerPhysics -> Is falling
    Action: Set JumpLabel to "FALLING"
  Condition: PlatformerPhysics -> Is on floor
    Action: Set JumpLabel to "GROUNDED"
```

**Expected:**
- `OnJumped` fires on each jump press (when on floor or with coyote time)
- `IsJumping` is true when VectorY < 0 (moving up) and not on floor
- `IsFalling` is true when VectorY > 0 (moving down) and not on floor
- `JumpsRemaining` decreases by 1 after each jump

---

## Test 6 - Variable Jump Height

**Goal:** Verify that releasing jump early produces a shorter jump.

### Event sheet

```
// Use default controls — tap Space briefly for short jump, hold for full jump

Event: Every tick
  Action: Set DebugText to "VY=" & PlatformerPhysics.VectorY
```

**Expected:**
- Tapping Space briefly: character reaches a low peak height
- Holding Space: character reaches full jump height
- The difference is noticeable — short jump should be roughly half the height of full jump
- VectorY is dampened (multiplied by 0.5) when jump is released early while moving upward

---

## Test 7 - Coyote Time

**Purpose:** Verify the character can still jump for a brief window after walking off a ledge.

**Setup:**
```
// Ensure Coyote Time = 0.1 in properties
// Place player on the edge of a platform
```

**Step 1 - Walk off the edge:**
```
// Walk right off the platform edge
Action: PlatformerPhysics -> Simulate control "Right"
// Wait until OnFallenOff fires
```
```
// Expected: OnFallenOff fires, coyote timer starts at 0.1
// CanJump should still return true
```

**Step 2 - Press jump within 0.1 seconds:**
```
Action: PlatformerPhysics -> Simulate control "Jump"
```
```
// Expected: Jump executes successfully even though not on floor
// OnJumped fires
```

**Step 3 - Press jump AFTER 0.1 seconds (no coyote):**
```
// Walk off edge, wait > 0.1 seconds, then press jump
```
```
// Expected: Jump does NOT execute (unless multi-jump is enabled)
// CanJump returns false
```

---

## Test 8 - Jump Buffer

**Purpose:** Verify the character jumps automatically on landing if jump was pressed slightly before touching the ground.

**Setup:**
```
// Ensure Jump Buffer = 0.1 in properties
// Player is falling toward a platform
```

**Step 1 - Press jump while still airborne (< 0.1s before landing):**
```
// While falling, press jump just before hitting the platform
Action: PlatformerPhysics -> Simulate control "Jump"
```
```
// Expected: Jump input is buffered
// When the character lands, the buffered jump fires automatically
// OnLanded fires, then OnJumped fires in the same or next tick
```

---

## Test 9 - Multi-Jump (Double Jump)

**Purpose:** Verify double jump behavior with Max Jumps = 2.

**Setup:**
```
Event: On start of layout
  Action: PlatformerPhysics -> Set max jumps to 2
```

**Step 1 - First jump from floor:**
```
Action: PlatformerPhysics -> Simulate control "Jump"
```
```
// Expected:
// OnJumped fires
// JumpsRemaining = 1
```

**Step 2 - Second jump while airborne:**
```
Action: PlatformerPhysics -> Simulate control "Jump"
```
```
// Expected:
// OnJumped fires
// OnDoubleJumped fires
// JumpsRemaining = 0
```

**Step 3 - Third jump attempt:**
```
Action: PlatformerPhysics -> Simulate control "Jump"
```
```
// Expected:
// Nothing happens — JumpsRemaining = 0
// CanJump = false
```

**Step 4 - Land on floor:**
```
// Character lands on platform
```
```
// Expected:
// OnLanded fires
// JumpsRemaining resets to 2
// CanJump = true
```

---

## Test 10 - Reset Jumps (Bounce Pad)

**Goal:** Verify `ResetJumps` restores the full jump count mid-air.

### Event sheet

```
Event: On start of layout
  Action: PlatformerPhysics -> Set max jumps to 2

Event: Player -> On collision with BouncePad
  Action: PlatformerPhysics -> Set vector Y to -800
  Action: PlatformerPhysics -> Reset jumps
```

**Expected:**
- After hitting the bounce pad, `JumpsRemaining` resets to 2
- Player can double-jump again after being launched
- `CanJump` returns true immediately after reset

**Expressions to verify:**
```
"Jumps: " & PlatformerPhysics.JumpsRemaining
"CanJump: " & PlatformerPhysics.CanJump
```

---

## Test 11 - Wall Detection (IsOnWall)

**Goal:** Verify wall contact detection on both sides.

### Event sheet

```
// Place vertical Platform objects on left and right sides

Event: Every tick
  Action: Set DebugText to
    "WallL=" & PlatformerPhysics.IsOnWall("Left")
    & " WallR=" & PlatformerPhysics.IsOnWall("Right")
    & " WallEither=" & PlatformerPhysics.IsOnWall("Either")
    & " Side=" & PlatformerPhysics.WallContactSide
```

**Expected:**
- Running into the left wall: `IsOnWall(Left)` = true, `WallContactSide` = -1
- Running into the right wall: `IsOnWall(Right)` = true, `WallContactSide` = 1
- No wall contact: `IsOnWall(Either)` = false, `WallContactSide` = 0

---

## Test 12 - Ceiling Detection (IsOnCeiling)

**Goal:** Verify ceiling contact stops upward velocity.

### Event sheet

```
// Place a Platform above the player at jump height

Event: Every tick
  Condition: PlatformerPhysics -> Is on ceiling
    Action: Set DebugText to "HIT CEILING! VY=" & PlatformerPhysics.VectorY
```

**Expected:**
- Jumping into the ceiling: `IsOnCeiling` briefly returns true
- Upward velocity is set to zero on ceiling contact (no sticking)
- Character immediately begins falling after hitting ceiling

---

## Test 13 - Wall Slide

**Purpose:** Verify wall slide clamps fall speed when pressing into a wall.

**Setup:**
```
Event: On start of layout
  Action: PlatformerPhysics -> Set wall slide to true
```

**Step 1 - Fall against a wall:**
```
// Jump next to a wall, hold direction into the wall while falling
Action: PlatformerPhysics -> Simulate control "Right"
// (assuming wall is on the right)
```
```
// Expected:
// IsWallSliding = true
// VectorY is clamped to Wall Slide Speed (80 px/s)
// Character falls slowly along the wall
```

**Step 2 - Release direction:**
```
// Stop pressing into the wall
```
```
// Expected:
// IsWallSliding = false
// Character resumes normal falling speed (up to MaxFallSpeed)
```

---

## Test 14 - Wall Jump

**Purpose:** Verify wall jump pushes away from the wall.

**Setup:**
```
Event: On start of layout
  Action: PlatformerPhysics -> Set wall jump to true
  Action: PlatformerPhysics -> Set wall slide to true
```

**Step 1 - Slide on right wall, then jump:**
```
// Jump to the right wall, hold Right to wall slide
Action: PlatformerPhysics -> Simulate control "Right"
// Then press jump
Action: PlatformerPhysics -> Simulate control "Jump"
```
```
// Expected:
// OnWallJumped fires
// OnJumped fires
// Character pushes LEFT (away from right wall) with WallJumpStrength
// Character moves UP with JumpStrength
// VectorX should be negative (pushed left)
// WallContactSide = 1 (was on right wall)
```

**Step 2 - Wall jump off left wall:**
```
// Repeat on left wall
```
```
// Expected:
// Character pushes RIGHT (away from left wall)
// VectorX should be positive
// WallContactSide = -1
```

---

## Test 15 - Set Vector X / Set Vector Y

**Goal:** Verify direct velocity overrides bypass the acceleration model.

### Event sheet

```
Event: Keyboard "1" on pressed
  Action: PlatformerPhysics -> Set vector X to 500
  // Should instantly move right at 500 px/s (exceeds MaxSpeed)

Event: Keyboard "2" on pressed
  Action: PlatformerPhysics -> Set vector Y to -800
  // Should launch upward instantly
```

**Expected:**
- `SetVectorX(500)` immediately sets horizontal velocity to 500, bypassing acceleration
- Velocity then decelerates back toward MaxSpeed on subsequent ticks (if no input)
- `SetVectorY(-800)` immediately launches the character upward

---

## Test 16 - Stop Action

**Goal:** Verify `Stop` immediately zeroes all velocity.

### Event sheet

```
Event: Keyboard "S" on pressed
  Action: PlatformerPhysics -> Stop

Event: Every tick
  Action: Set DebugText to "VX=" & PlatformerPhysics.VectorX & " VY=" & PlatformerPhysics.VectorY
```

**Expected:**
- While moving and/or falling, pressing S immediately shows VX=0 VY=0
- Character stops in place (gravity will resume pulling them down next tick)

---

## Test 17 - Ignore Input

**Purpose:** Verify that `SetIgnoreInput(true)` blocks all input while physics continue.

**Setup:**
```
Event: Keyboard "I" on pressed
  Action: PlatformerPhysics -> Set ignore input to true

Event: Keyboard "O" on pressed
  Action: PlatformerPhysics -> Set ignore input to false
```

**Step 1 - Enable ignore input while standing:**
```
Action: PlatformerPhysics -> Set ignore input to true
```
```
// Expected:
// Arrow keys and Space do nothing
// SimulateControl calls are ignored
// IsIgnoringInput = true
// Character stays on floor (gravity keeps them grounded)
```

**Step 2 - Enable ignore input while airborne:**
```
// Jump, then immediately set ignore input
Action: PlatformerPhysics -> Set ignore input to true
```
```
// Expected:
// No new input accepted
// But character continues falling (gravity and physics still apply)
// Character lands normally, OnLanded still fires
```

**Step 3 - Restore input:**
```
Action: PlatformerPhysics -> Set ignore input to false
```
```
// Expected:
// Controls work again immediately
// IsIgnoringInput = false
```

---

## Test 18 - Set Enabled / Disable Behavior

**Purpose:** Verify the behavior fully disables and re-enables.

**Setup:**
```
Event: Keyboard "E" on pressed
  Action: PlatformerPhysics -> Set enabled to false

Event: Keyboard "R" on pressed
  Action: PlatformerPhysics -> Set enabled to true
```

**Step 1 - Disable while standing on floor:**
```
Action: PlatformerPhysics -> Set enabled to false
```
```
// Expected:
// IsEnabled = false
// All internal state resets (onFloor, jumpsRemaining, timers)
// Behavior stops modifying Physics velocity
// Character is now a pure Physics body (may slide if Physics gravity active)
```

**Step 2 - Re-enable:**
```
Action: PlatformerPhysics -> Set enabled to true
```
```
// Expected:
// IsEnabled = true
// Behavior resumes controlling movement on next tick
```

---

## Test 19 - Configuration Overrides at Runtime

**Goal:** Verify all configuration actions take effect immediately.

### Event sheet

```
Event: Keyboard "1" on pressed
  Action: PlatformerPhysics -> Set max speed to 400
  Action: PlatformerPhysics -> Set acceleration to 3000

Event: Keyboard "2" on pressed
  Action: PlatformerPhysics -> Set max speed to 200
  Action: PlatformerPhysics -> Set acceleration to 1500

Event: Keyboard "3" on pressed
  Action: PlatformerPhysics -> Set jump strength to 900

Event: Keyboard "4" on pressed
  Action: PlatformerPhysics -> Set gravity to 3000

Event: Every tick
  Action: Set DebugText to
    "MaxSpeed=" & PlatformerPhysics.MaxSpeed
    & " Accel=" & PlatformerPhysics.Acceleration
    & " Decel=" & PlatformerPhysics.Deceleration
    & " JumpStr=" & PlatformerPhysics.JumpStrength
    & " Gravity=" & PlatformerPhysics.Gravity
    & " MaxFall=" & PlatformerPhysics.MaxFallSpeed
```

**Expected:**
- Pressing 1: character moves faster (400 px/s max), accelerates quicker
- Pressing 2: character returns to default speed
- Pressing 3: character jumps higher
- Pressing 4: character falls faster
- All expression values update immediately after each action

---

## Test 20 - Facing Direction

**Goal:** Verify facing direction tracking and the OnFacingChanged trigger.

### Event sheet

```
Trigger: PlatformerPhysics -> On facing changed
  Action: Set DebugText to "FACING CHANGED to " & PlatformerPhysics.FacingDirection

Event: Every tick
  Condition: PlatformerPhysics -> Is facing right
    Action: Player -> Set mirrored to false
  Condition: PlatformerPhysics -> Is facing right [INVERTED]
    Action: Player -> Set mirrored to true
```

**Expected:**
- Moving right: `FacingDirection` = 1, `IsFacingRight` = true
- Moving left: `FacingDirection` = -1, `IsFacingRight` = false
- `OnFacingChanged` fires exactly once per direction change
- Facing does NOT change when not pressing any direction

---

## Test 21 - Compare Conditions

**Goal:** Verify CompareSpeed, CompareVectorX, and CompareVectorY.

### Event sheet

```
Event: Every tick
  Condition: PlatformerPhysics -> Compare speed > 100
    Action: Set SpeedLabel to "FAST"
  Condition: PlatformerPhysics -> Compare speed ≤ 100
    Action: Set SpeedLabel to "SLOW"

  Condition: PlatformerPhysics -> Compare vector X > 0
    Action: Set DirLabel to "MOVING RIGHT"
  Condition: PlatformerPhysics -> Compare vector X < 0
    Action: Set DirLabel to "MOVING LEFT"
  Condition: PlatformerPhysics -> Compare vector X = 0
    Action: Set DirLabel to "STATIONARY"

  Condition: PlatformerPhysics -> Compare vector Y > 0
    Action: Set FallLabel to "FALLING"
  Condition: PlatformerPhysics -> Compare vector Y < 0
    Action: Set FallLabel to "RISING"
```

**Expected:**
- Labels update correctly based on current velocity
- Comparison operators (<, ≤, =, ≥, >) all function correctly

---

## Test 22 - MovingAngle Expression

**Goal:** Verify the MovingAngle expression returns correct direction.

### Event sheet

```
Event: Every tick
  Action: Set DebugText to "Angle=" & PlatformerPhysics.MovingAngle
```

**Expected:**
- Moving right on floor: ~0°
- Moving left on floor: ~180° (or -180°)
- Falling straight down: ~90°
- Jumping straight up: ~-90°
- Stationary: 0°

---

## Test 23 - IsMoving Condition

**Goal:** Verify IsMoving threshold (> 0.5 px/s).

### Event sheet

```
Event: Every tick
  Condition: PlatformerPhysics -> Is moving
    Action: Player -> Set animation to "Run"
  Condition: PlatformerPhysics -> Is moving [INVERTED]
    Action: Player -> Set animation to "Idle"
```

**Expected:**
- While running: animation = "Run"
- After decelerating to near-zero: animation switches to "Idle" when Speed drops below 0.5

---

## Test 24 - CanJump Condition

**Goal:** Verify CanJump reflects on-floor, coyote, and multi-jump state.

### Event sheet

```
Event: Every tick
  Action: Set DebugText to "CanJump=" & PlatformerPhysics.CanJump
    & " Floor=" & PlatformerPhysics.IsOnFloor
    & " Jumps=" & PlatformerPhysics.JumpsRemaining
```

**Expected:**
- On floor: `CanJump` = true
- Just walked off ledge (within coyote time): `CanJump` = true
- Airborne, no jumps remaining, coyote expired: `CanJump` = false
- With MaxJumps=2, after first jump: `CanJump` = true (1 jump remaining)

---

## Test 25 - All Expressions Snapshot

**Goal:** Verify every expression returns a valid value.

### Event sheet

```
Event: Every tick
  Action: Set DebugText to
    "Speed=" & PlatformerPhysics.Speed
    & "\nMaxSpeed=" & PlatformerPhysics.MaxSpeed
    & "\nVectorX=" & PlatformerPhysics.VectorX
    & "\nVectorY=" & PlatformerPhysics.VectorY
    & "\nJumpStrength=" & PlatformerPhysics.JumpStrength
    & "\nGravity=" & PlatformerPhysics.Gravity
    & "\nMaxFallSpeed=" & PlatformerPhysics.MaxFallSpeed
    & "\nAcceleration=" & PlatformerPhysics.Acceleration
    & "\nDeceleration=" & PlatformerPhysics.Deceleration
    & "\nMovingAngle=" & PlatformerPhysics.MovingAngle
    & "\nJumpsRemaining=" & PlatformerPhysics.JumpsRemaining
    & "\nAirTime=" & PlatformerPhysics.AirTime
    & "\nFacingDirection=" & PlatformerPhysics.FacingDirection
    & "\nWallContactSide=" & PlatformerPhysics.WallContactSide
```

**Expected baseline values (standing still on floor):**
```
Speed = 0 (or near 0)
MaxSpeed = 200
VectorX = 0
VectorY = 0 (or near 0)
JumpStrength = 600
Gravity = 1500
MaxFallSpeed = 1000
Acceleration = 1500
Deceleration = 1500
MovingAngle = 0
JumpsRemaining = 1
AirTime = 0
FacingDirection = 1
WallContactSide = 0
```

---

## Test 26 - Debug Mode Console Output

**Goal:** Verify Debug Mode prints structured logs each tick.

### Event sheet

```
// Ensure Debug Mode = checked in properties
// No special events needed
```

**Expected:**
- Open browser console (F12 → Console tab)
- Filter by `[GroundForce]`
- Each tick outputs a line like:
```
[GroundForce] floor=1(2) wall=none ceil=false | vx=0.0 vy=0.0 | jumps=1/1 coyote=0.000 buf=0.000 air=0.00s | slide=false facing=R
```
- Values update in real-time as the character moves, jumps, and contacts surfaces

---

## Test 27 - Physics Interaction (Pushing Crates)

**Goal:** Verify the character physically pushes Physics objects.

### Event sheet

```
// Create a Sprite "Crate" with Physics behavior (not immovable, density 0.5)
// Place it on the platform next to the player

// No special events needed — Physics handles the interaction
```

**Expected:**
- Running into the crate pushes it across the platform
- The crate reacts realistically to the player's velocity
- Player movement is slightly impeded by the crate's mass
- Jumping onto the crate works (floor contact on top of the crate)

---

## Test 28 - Max Fall Speed Clamp

**Goal:** Verify terminal velocity is correctly clamped.

### Event sheet

```
// Create a very tall layout with a long drop

Event: Every tick
  Action: Set DebugText to "VY=" & PlatformerPhysics.VectorY & " MaxFall=" & PlatformerPhysics.MaxFallSpeed
```

**Expected:**
- During a long fall, VectorY increases but never exceeds MaxFallSpeed (1000)
- Changing MaxFallSpeed at runtime immediately affects the clamp:
```
Event: Keyboard "M" on pressed
  Action: PlatformerPhysics -> Set max fall speed to 200
  // Character now falls much more slowly
```

---

## Test 29 - Gravity Override

**Purpose:** Verify the additional gravity property works correctly.

**Setup:**
```
// Set Physics world gravity to 0 in Physics behavior properties
// Set Platformer Physics Gravity to 1500
```

**Step 1 - Verify falling with Platformer Physics gravity only:**
```
// Jump and observe fall
```
```
// Expected: Character falls at the same rate as built-in Platform behavior
// VectorY increases by approximately 1500 * dt each tick
```

**Step 2 - Change gravity at runtime:**
```
Event: Keyboard "G" on pressed
  Action: PlatformerPhysics -> Set gravity to 500
```
```
// Expected: Character falls much more slowly (moon gravity)
// Jumps go higher and last longer
```

**Step 3 - Zero gravity:**
```
Event: Keyboard "0" on pressed
  Action: PlatformerPhysics -> Set gravity to 0
```
```
// Expected: If Physics world gravity is also 0, character floats
// After jumping, VectorY stays constant (no downward pull)
```

---

## Test 30 - Save and Load

**Goal:** Verify all state survives a savegame round-trip.

### Event sheet

```
Event: On start of layout
  Action: PlatformerPhysics -> Set max jumps to 2
  Action: PlatformerPhysics -> Set max speed to 300
  Action: PlatformerPhysics -> Set wall jump to true
  Action: PlatformerPhysics -> Set jump release damping to 30
  Action: PlatformerPhysics -> Set freeze axis Horizontal to true

Event: Keyboard "F5" on pressed
  Action: Save game to slot "test"

Event: Keyboard "F9" on pressed
  Action: Load game from slot "test"

Event: Every tick
  Action: Set DebugText to
    "MaxSpeed=" & PlatformerPhysics.MaxSpeed
    & " Jumps=" & PlatformerPhysics.JumpsRemaining
    & " Facing=" & PlatformerPhysics.FacingDirection
    & " Enabled=" & PlatformerPhysics.IsEnabled
```

**Expected:**
- After changing settings and saving, then reloading:
  - MaxSpeed = 300 (not default 200)
  - Wall jump still enabled
  - Max jumps still 2
  - Facing direction preserved
  - Jump release damping = 30% (not default 50%)
  - Horizontal axis still frozen
  - All timer values preserved

---

## Test 31 - Set Vector (Both Axes)

**Goal:** Verify `Set vector` sets both X and Y velocity simultaneously.

### Event sheet

```
Event: Keyboard "V" on pressed
  Action: PlatformerPhysics -> Set vector to (350, -700)
  // Launches character diagonally: right and up

Event: Every tick
  Action: Set DebugText to "VX=" & PlatformerPhysics.VectorX & " VY=" & PlatformerPhysics.VectorY
```

**Expected:**
- Pressing V immediately sets VectorX = 350 and VectorY = -700
- Character launches diagonally up-right in a single action
- Velocity then decays/changes normally from gravity and deceleration on subsequent ticks
- Equivalent to calling SetVectorX(350) and SetVectorY(-700) separately

---

## Test 32 - Set Jump Release Damping

**Purpose:** Verify `Set jump release damping` changes how variable jump height behaves.

**Setup:**
```
// Ensure Variable Jump Height = checked in properties
```

**Step 1 - Default damping (50%):**
```
// Jump and release early — observe peak height
```
```
// Expected: Short hop reaches moderate height (50% of upward velocity retained)
```

**Step 2 - Set damping to 20% (very responsive):**
```
Event: Keyboard "1" on pressed
  Action: PlatformerPhysics -> Set jump release damping to 20
```
```
// Expected: Short hop is much shorter — only 20% of upward velocity retained
// Full hold jump is unchanged
```

**Step 3 - Set damping to 90% (minimal effect):**
```
Event: Keyboard "2" on pressed
  Action: PlatformerPhysics -> Set jump release damping to 90
```
```
// Expected: Releasing early barely affects jump height — 90% retained
// Short hop and full jump look nearly identical
```

**Step 4 - Set damping to 0% (instant stop):**
```
Event: Keyboard "3" on pressed
  Action: PlatformerPhysics -> Set jump release damping to 0
```
```
// Expected: Releasing jump immediately kills all upward velocity
// Character stops rising the instant the button is released
```

**Step 5 - Value clamping:**
```
Event: Keyboard "4" on pressed
  Action: PlatformerPhysics -> Set jump release damping to 150
```
```
// Expected: Value is clamped to 100 internally (no error)
```

---

## Test 33 - Freeze Axis

**Purpose:** Verify `Set freeze axis` locks movement on the specified axis.

**Setup:**
```
Event: Keyboard "H" on pressed
  Action: PlatformerPhysics -> Set freeze axis Horizontal to true

Event: Keyboard "U" on pressed
  Action: PlatformerPhysics -> Set freeze axis Horizontal to false

Event: Keyboard "J" on pressed
  Action: PlatformerPhysics -> Set freeze axis Vertical to true

Event: Keyboard "K" on pressed
  Action: PlatformerPhysics -> Set freeze axis Vertical to false

Event: Keyboard "B" on pressed
  Action: PlatformerPhysics -> Set freeze axis Both to true

Event: Keyboard "N" on pressed
  Action: PlatformerPhysics -> Set freeze axis Both to false
```

**Step 1 - Freeze horizontal:**
```
// Press H, then try to move left/right
```
```
// Expected:
// VectorX is forced to 0 every tick
// Arrow keys / SimulateControl Left/Right have no effect
// Character can still jump and fall (VectorY unaffected)
// SetVectorX is also overridden — freeze wins
```

**Step 2 - Freeze vertical:**
```
// Press J while standing on floor, then walk off a ledge
```
```
// Expected:
// VectorY is forced to 0 every tick
// Character floats — gravity cannot pull them down
// Character can still move left/right
// Jumping has no effect (upward velocity is zeroed)
```

**Step 3 - Freeze both:**
```
// Press B while moving
```
```
// Expected:
// Character is completely locked in place
// VX = 0, VY = 0 every tick
// No input, gravity, or direct velocity calls can move the character
```

**Step 4 - Unfreeze:**
```
// Press N to unfreeze both
```
```
// Expected:
// Normal movement resumes immediately
// Gravity takes effect, input works again
```

**Expressions to verify:**
```
"FreezeX=" & PlatformerPhysics.IsAxisFrozen("Horizontal")
"FreezeY=" & PlatformerPhysics.IsAxisFrozen("Vertical")
"VX=" & PlatformerPhysics.VectorX
"VY=" & PlatformerPhysics.VectorY
```

---

## Test 34 - Is Axis Frozen Condition

**Goal:** Verify the `Is axis frozen` condition and its inversion.

### Event sheet

```
Event: On start of layout
  Action: PlatformerPhysics -> Set freeze axis Horizontal to true

Event: Every tick
  Condition: PlatformerPhysics -> Is Horizontal axis frozen
    Action: Set FreezeLabel to "H: FROZEN"
  Condition: PlatformerPhysics -> Is Horizontal axis frozen [INVERTED]
    Action: Set FreezeLabel to "H: FREE"

  Condition: PlatformerPhysics -> Is Vertical axis frozen
    Action: Append FreezeLabel with " | V: FROZEN"
  Condition: PlatformerPhysics -> Is Vertical axis frozen [INVERTED]
    Action: Append FreezeLabel with " | V: FREE"
```

**Expected:**
- Initially: `"H: FROZEN | V: FREE"`
- After freezing vertical: `"H: FROZEN | V: FROZEN"`
- After unfreezing horizontal: `"H: FREE | V: FROZEN"`
- Inverted conditions work correctly (opposite of the non-inverted result)

---

## Test 35 - C3 Debugger Panel

**Purpose:** Verify the C3 Debugger panel shows correct live values for all sections.

**Setup:**
```
// Preview the project, open F12 Developer Tools, click the Debugger tab
// Select the Player instance — the behavior's debugger sections should appear
```

**Step 1 - Verify sections appear:**
```
// Expected sections in the debugger:
// - "Platformer Physics"
// - "Velocity"
// - "Jumping"
// - "Movement Config"
// - "Wall Interaction"
```

**Step 2 - Verify baseline values (standing still on floor):**
```
// Platformer Physics section:
Enabled = true
On floor = true
On ceiling = false
On wall (L) = false
On wall (R) = false
Wall sliding = false
Facing = "Right"

// Velocity section:
Speed = 0
Vector X = 0
Vector Y = 0 (or near 0)
Max speed = 200
Max fall speed = 1000

// Jumping section:
Jump strength = 600
Jumps remaining = 1
Max jumps = 1
Coyote timer = 0
Jump buffer = 0
Air time = 0
Variable jump = true
Release damping = "50%"

// Movement Config section:
Acceleration = 1500
Deceleration = 1500
Gravity = 1500
Ignore input = false
Default controls = true
Freeze X = false
Freeze Y = false

// Wall Interaction section:
Wall slide = false
Wall slide speed = 80
Wall jump = false
Wall jump strength = 450
Wall contact side = "None"
```

**Step 3 - Verify values update live:**
```
// Move right — Vector X increases, Speed increases, Facing = "Right"
// Jump — Air time counts up, Jumps remaining decreases, Vector Y negative
// Land — On floor = true, Air time = 0, Jumps remaining resets
// Run into wall — On wall (R) = true, Wall contact side = "Right"
// Freeze horizontal — Freeze X = true
// Set jump release damping to 20 — Release damping = "20%"
```

**Step 4 - Verify after config changes:**
```
// Set max speed to 400 → Max speed = 400 in debugger
// Set gravity to 500 → Gravity = 500 in debugger
// Set wall slide to true → Wall slide = true in debugger
// Disable behavior → Enabled = false in debugger
```

---

## Debugging Tips

- **Enable Debug Mode** in the behavior properties to get per-tick console logs showing contact classification, velocity, jump state, and timers. Filter the browser console by `[GroundForce]`.

- **Check the browser console for warnings.** If the Physics behavior is missing, Platformer Physics logs `[GroundForce] Physics behavior not found on instance. Disabling.` and disables itself.

- **No Keyboard object is needed.** Default controls use DOM `keydown`/`keyup` events directly. If controls don't work, check that the behavior is enabled and `Set ignore input` is not active.

- **Use the C3 Debugger panel** (F12 → Debugger tab) to inspect live behavior state. Select the Player instance to see the Platformer Physics sections: contact state, velocity, jumping, movement config, and wall interaction — all updating in real time.

- **Set Physics friction and linear damping to 0.** Non-zero values fight the acceleration model and cause sluggish, inconsistent movement that looks like a bug but is a configuration issue.

- **Verify Physics collision shape alignment.** If the character gets stuck on platform edges or slopes feel wrong, the Physics collision shape likely doesn't match the sprite bounding box well. Use a convex capsule or rounded rectangle for best results.

- **SimulateControl calls accumulate per tick.** If the character moves in unexpected directions, check whether multiple SimulateControl calls are stacking. Left + Right = no movement. Multiple Right calls in one tick still clamp to 1.
