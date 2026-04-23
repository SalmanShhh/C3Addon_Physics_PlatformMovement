<img src="./src/icon.svg" width="100" /><br>
# Physics Platformer
<i>Physics-based platformer movement — run, jump, wall-slide, and interact using the built-in Physics behavior.</i> <br>
### Version 1.5.0.0

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon_Physics_PlatformMovement/releases/download/salmanshh_platformer_physics-1.5.0.0.c3addon/salmanshh_platformer_physics-1.5.0.0.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/C3Addon_Physics_PlatformMovement/releases) </sub> <br>

#### What's New in 1.5.0.0
- **Added:** - Add Actions to Toggle whether character is touching a ceiling.
- **Changed:** - Knockback, given a more descriptive name to understand its versatility better. "Driven Movement"

<sub>[View full changelog](#changelog)</sub>

---
<b><u>Author:</u></b> SalmanShh <br>
<sub>Made using [CAW](https://marketplace.visualstudio.com/items?itemName=skymen.caw) </sub><br>

## Table of Contents
- [Usage](#usage)
- [Examples Files](#examples-files)
- [Properties](#properties)
- [Actions](#actions)
- [Conditions](#conditions)
- [Expressions](#expressions)
---
## Usage
To build the addon, run the following commands:

```
npm i
npm run build
```

To run the dev server, run

```
npm i
npm run dev
```

## Examples Files
| Description | Download |
| --- | --- |
| Example Project Physics Platformer | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/SalmanShhh/C3Addon_Physics_PlatformMovement/raw/refs/heads/main/examples/Example%20Project%20Physics%20Platformer.c3p) |

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Max Speed | Maximum horizontal movement speed in px/s. | float |
| Acceleration | Rate at which horizontal velocity increases toward Max Speed (px/s²). | float |
| Deceleration | Rate at which horizontal velocity decreases to zero when no input is given (px/s²). | float |
| Jump Strength | Upward impulse magnitude applied when a jump executes (px/s). | float |
| Gravity | Additional downward acceleration (px/s²) applied per tick on top of Physics world gravity. | float |
| Max Fall Speed | Terminal velocity clamp (px/s downward). | float |
| Slope Tolerance | Contact classification threshold as a fraction of half-height below center to count as floor. | float |
| Coyote Time | Seconds after leaving a floor edge during which a jump is still allowed. | float |
| Wall Coyote Time | Seconds after leaving a wall during which a wall jump is still allowed. Mirrors floor coyote time for walls. Set to 0 to disable. | float |
| Jump Buffer | Seconds a jump input is remembered before landing. | float |
| Max Jumps | Total jumps allowed per airborne period. 1 = single jump, 2 = double jump. | integer |
| Wall Slide | Clamp fall speed to Wall Slide Speed when pressing into a wall while airborne. | check |
| Wall Slide Speed | Maximum downward speed (px/s) while wall sliding. | float |
| Wall Jump | Allow jumping off a wall. | check |
| Wall Jump Strength | Horizontal impulse component of a wall jump. | float |
| Variable Jump Height | Hold the jump button for a higher jump, release it early for a shorter one. | check |
| Jump Release Damping | Percentage (0–100) of upward velocity retained when the jump button is released early. 50 = keep half speed; 0 = instant cut; 100 = no variable height effect. | float |
| Debug Mode | Print contact classification and velocity state to the browser console each tick. | check |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Set acceleration | Change how quickly the character speeds up. | Acceleration             *(number)* <br> |
| Set coyote time | How long after walking off a ledge the player can still jump. Makes platforming more forgiving. Set to 0 to disable. | Time             *(number)* <br> |
| Set debug mode | Turn debug console output on or off. Prints movement state to the browser console (F12) — handy when tuning values. | Enabled             *(boolean)* <br> |
| Set deceleration | How quickly the character stops when releasing input. Low = icy sliding, high = instant stop. | Deceleration             *(number)* <br> |
| Set gravity | Override the additional downward gravity (px/s²) at runtime. | Gravity             *(number)* <br> |
| Set jump buffer | How early before landing a jump press is accepted. Prevents missed jumps when the button is pressed slightly too soon. Set to 0 to disable. | Time             *(number)* <br> |
| Set jump strength | Change how high the character jumps. | Strength             *(number)* <br> |
| Set max fall speed | Change the maximum fall speed the character can reach. | Speed             *(number)* <br> |
| Set max speed | Change the top running speed. | Speed             *(number)* <br> |
| Reset jumps | Give all jumps back, as if the character just landed. |  |
| Set jump release damping | Set the percentage of upward velocity retained when the jump button is released early. Lower values give more control over jump height. | Damping %             *(number)* <br> |
| Set max jumps | How many times the character can jump before touching the ground. Set to 2 to unlock double jump. | Count             *(number)* <br> |
| Set variable jump height | Tap for a short hop, hold for a full jump. Disable for a fixed jump height every time. | Enabled             *(boolean)* <br> |
| Set wall coyote time | How long after leaving a wall the player can still wall jump. Forgives slightly late button presses. Set to 0 to disable. | Time             *(number)* <br> |
| Set wall jump | Toggle the ability to jump off walls. | Enabled             *(boolean)* <br> |
| Set wall jump strength | How far the character pushes away from the wall on a wall jump. Higher = wider arc — use to tune the feel of vertical shaft climbing. | Strength             *(number)* <br> |
| Set wall slide | Toggle the ability to slide down walls. | Enabled             *(boolean)* <br> |
| Set wall slide speed | How fast the character slides down a wall. Lower = slower, more controlled. e.g. set very low for a sticky-wall ability. | Speed             *(number)* <br> |
| Apply impulse | Add a push to the character's current velocity, they keep control and deceleration tapers it off. | Vector X             *(number)* <br>Vector Y             *(number)* <br> |
| Set driven move | Temporarily drives the character at the given velocity, suppressing movement input for the duration. Use for dashes, knockback, launch pads, or any externally driven movement. Gravity, wall slide, and max fall speed still apply. | Vector X             *(number)* <br>Vector Y             *(number)* <br>Duration             *(number)* <br> |
| Set enabled | Turn the whole behavior on or off. | Enabled             *(boolean)* <br> |
| Set freeze axis | Lock movement on one or both axes. | Axis             *(combo)* <br>Freeze             *(boolean)* <br> |
| Set ignore input | Block all character input without stopping physics. | Ignore             *(boolean)* <br> |
| Set on ceiling | Force the character to be treated as touching a ceiling this tick. Use with moving platforms or ceiling colliders where Physics contact alone is unreliable. | On ceiling             *(boolean)* <br> |
| Set on floor | Force the character to be treated as grounded this tick. Use with moving platforms where Physics contact alone is unreliable. | On floor             *(boolean)* <br> |
| Set vector | Set horizontal and vertical speed in px/s. | Vector X             *(number)* <br>Vector Y             *(number)* <br> |
| Set vector X | Directly set the horizontal Physics velocity (px/s). | Vector X             *(number)* <br> |
| Set vector Y | Directly set the vertical Physics velocity (px/s). | Vector Y             *(number)* <br> |
| Simulate control | Simulate one of the movement controls being held down. | Control             *(combo)* <br> |
| Stop | Instantly stop all movement. |  |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Can jump | True when a jump is possible right now (on ground, in coyote window, or has jumps left). |  |
| Compare speed | Compare the character's current speed to a value. | Comparison *(combo)* <br>Speed *(number)* <br> |
| Compare vector X | Compare the current X velocity component against a value. | Comparison *(combo)* <br>Vector X *(number)* <br> |
| Compare vector Y | Compare the current Y velocity component against a value. Positive = downward. | Comparison *(combo)* <br>Vector Y *(number)* <br> |
| Is Movement Ability enabled | True if the chosen ability is currently on. Use to show unlock icons in an ability upgrade UI. | Ability *(combo)* <br> |
| Compare animation mode | True when the animation state matches the selected option. Use to drive sprite animation switching without tracking state manually. | Mode *(combo)* <br> |
| Is axis frozen | True if the chosen axis is currently locked. Use to check whether a stasis or freeze effect is still active. | Axis *(combo)* <br> |
| Is driven moving | True while a driven move (e.g. dash or knockback) is in progress. Use to lock out other actions until it finishes. |  |
| Is enabled | Check if the behavior is currently active. |  |
| Is facing right | Check if the character is facing right. Invert for facing left. |  |
| Is falling | True while the character is moving downward in the air. |  |
| Is ignoring input | Check if input is currently being ignored. |  |
| Is jumping | True while the character is moving upward after a jump. |  |
| Is moving | True whenever the character has any movement. |  |
| Is on ceiling | True when touching a ceiling. Use to cut upward velocity when the character bumps their head. |  |
| Is on floor | True when touching the ground. |  |
| Is on wall | True when touching the chosen wall side. Use to play a wall-grab or push animation. | Side *(combo)* <br> |
| Is wall sliding | True while sliding down a wall. |  |
| On double jumped | Triggered when the character uses an extra mid-air jump. |  |
| On facing changed | Triggered when the character turns around. |  |
| On fallen off | Triggered when the character walks off a ledge. |  |
| On hit ceiling | Triggered when the character first makes contact with a ceiling. |  |
| On jumped | Triggered every time the character jumps. |  |
| On landed | Triggered when the character touches the ground after being in the air. |  |
| On left wall contact | Fires when the character leaves a wall without landing. The wall coyote window opens here — use to start a wall-coyote timer indicator. |  |
| On wall jumped | Triggered when the character jumps off a wall. |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| Acceleration | Current Acceleration setting (px/s²). | number |  | 
| AirTime | Seconds the character has been in the air. 0 on the ground. | number |  | 
| AnimMode | Current animation mode string: "Idle", "Moving", "Jumping", "Falling", "Wall sliding", or "Disabled". | string |  | 
| Deceleration | Current Deceleration setting (px/s²). | number |  | 
| FacingDirection | Current facing as a signed number: -1 = left, 1 = right. | number |  | 
| Gravity | Current additional gravity setting (px/s²). | number |  | 
| JumpsRemaining | How many jumps the character has left before landing. | number |  | 
| JumpStrength | Current Jump Strength setting. | number |  | 
| MaxFallSpeed | Current Max Fall Speed setting (px/s). | number |  | 
| MaxSpeed | Current Max Speed setting (px/s). | number |  | 
| MovingAngle | The angle the character is moving in degrees. | number |  | 
| Speed | Current movement speed in px/s (magnitude of velocity vector). | number |  | 
| VectorX | Current horizontal Physics velocity (px/s). Positive = right. | number |  | 
| VectorY | Current vertical Physics velocity (px/s). Positive = down. | number |  | 
| WallContactSide | Side of the most recent wall contact: -1 = left wall, 1 = right wall, 0 = no wall. | number |  | 
| WallCoyoteTimer | Seconds left in the wall coyote window. Use to show a brief visual cue that a wall jump is still possible. | number |  | 


---
## Changelog

**1.5.0.0**
- **Added:** - Add Actions to Toggle whether character is touching a ceiling.
- **Changed:** - Knockback, given a more descriptive name to understand its versatility better. "Driven Movement"

**1.4.3.0**
- **Added:** - Add wall-coyote support and improve ACE docs/usability hints.
- **Added:** - Add IsAbilityEnabled to include the new wall Coyote Time.
- **Added:** -
- **Fixed:** - refine descriptions across many conditions, actions and expressions to provide clearer usage hints

**1.4.2.0**
- **Changed:** Rename the knockback feature to a more general "driven move"

**1.4.1.0**
- **Added:** - Adds animation-mode.
- **Added:** - knockback conditions/expressions.
- **Added:** - improve robustness of floor/wall detection across collision shapes.
- **Added:** - Debugger properties are editable.
- **Added:** - ACE to overwrite whether character is "on the Floor" (Grounded)

**1.4.0.0**
- **Added:** - Adds animation-mode.
- **Added:** - knockback conditions/expressions.
- **Added:** - improve robustness of floor/wall detection across collision shapes.
- **Added:** - Debugger properties are editable.
- **Added:** - ACE to overwrite whether character is "on the Floor" (Grounded)

**1.3.0.0**
- **Added:** - Add Scripting Support
- **Added:** - Debugger support, shows same properties as the built-in Platform Movement Behavior.

**1.2.0.0**
- **Added:** Introduce a public scripting API  This change centralizes buff/stat logic for easier maintenance and enables direct use from C3 JS Scripting + Update Guide accordingly.

**1.1.0.1**

**1.1.0.0**
- **Added:** Initial feature spec for the Addon.

**0.0.0.0**
- **Added:** Initial release.
