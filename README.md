<img src="./src/icon.svg" width="100" /><br>
# Platformer Physics
<i>Platform-style movement driven by the Physics engine — run, jump, wall-slide, and interact using the built-in Physics behavior.</i> <br>
### Version 1.1.0.1

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon_platformer_physics/releases/download/salmanshh_platformer_physics-1.1.0.1.c3addon/salmanshh_platformer_physics-1.1.0.1.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/C3Addon_platformer_physics/releases) </sub> <br>

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
| Default Controls | When true, the behavior reads Arrow Left/Right, A/D, and Space/Up/W from the runtime keyboard each tick. | check |
| Slope Tolerance | Contact classification threshold as a fraction of half-height below center to count as floor. | float |
| Coyote Time | Seconds after leaving a floor edge during which a jump is still allowed. | float |
| Jump Buffer | Seconds a jump input is remembered before landing. | float |
| Max Jumps | Total jumps allowed per airborne period. 1 = single jump, 2 = double jump. | integer |
| Wall Slide | Clamp fall speed to Wall Slide Speed when pressing into a wall while airborne. | check |
| Wall Slide Speed | Maximum downward speed (px/s) while wall sliding. | float |
| Wall Jump | Allow jumping off a wall. | check |
| Wall Jump Strength | Horizontal impulse component of a wall jump. | float |
| Variable Jump Height | Releasing jump early dampens upward velocity, giving short/tall jump variation. | check |
| Debug Mode | Print contact classification and velocity state to the browser console each tick. | check |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Set acceleration | Change how quickly the character speeds up. | Acceleration             *(number)* <br> |
| Set deceleration | Override Deceleration at runtime. | Deceleration             *(number)* <br> |
| Set gravity | Override the additional downward gravity (px/s²) at runtime. | Gravity             *(number)* <br> |
| Set jump strength | Change how high the character jumps. | Strength             *(number)* <br> |
| Set max fall speed | Change the maximum fall speed the character can reach. | Speed             *(number)* <br> |
| Set max speed | Change the top running speed. | Speed             *(number)* <br> |
| Reset jumps | Give back all jumps as if the character just landed. |  |
| Set jump release damping | Set the percentage of upward velocity retained when the jump button is released early. Lower values give more control over jump height. | Damping %             *(number)* <br> |
| Set max jumps | Set how many times the character can jump before landing. | Count             *(number)* <br> |
| Set wall jump | Toggle the ability to jump off walls. | Enabled             *(boolean)* <br> |
| Set wall slide | Toggle the ability to slide down walls. | Enabled             *(boolean)* <br> |
| Set default controls | Enable or disable automatic keyboard input reading. | Enabled             *(boolean)* <br> |
| Set enabled | Fully enable or disable the behavior. | Enabled             *(boolean)* <br> |
| Set freeze axis | Lock an axis so the character cannot move on it. | Axis             *(combo)* <br>Freeze             *(boolean)* <br> |
| Set ignore input | When true, all input is ignored until re-enabled. | Ignore             *(boolean)* <br> |
| Set vector | Set horizontal and vertical speed in px/s. | Vector X             *(number)* <br>Vector Y             *(number)* <br> |
| Set vector X | Directly set the horizontal Physics velocity (px/s). | Vector X             *(number)* <br> |
| Set vector Y | Directly set the vertical Physics velocity (px/s). | Vector Y             *(number)* <br> |
| Simulate control | Simulate pressing or releasing a movement control this tick. | Control             *(combo)* <br> |
| Stop | Instantly stop all movement. |  |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Can jump | Check if the character is able to jump right now. |  |
| Compare speed | Compare the character's current speed to a value. | Comparison *(combo)* <br>Speed *(number)* <br> |
| Compare vector X | Compare the current X velocity component against a value. | Comparison *(combo)* <br>Vector X *(number)* <br> |
| Compare vector Y | Compare the current Y velocity component against a value. Positive = downward. | Comparison *(combo)* <br>Vector Y *(number)* <br> |
| Is axis frozen | Check if an axis is currently frozen. | Axis *(combo)* <br> |
| Is enabled | Check if the behavior is currently active. |  |
| Is facing right | Check if the character is facing right. Invert for facing left. |  |
| Is falling | Check if the character is falling through the air. |  |
| Is ignoring input | Check if input is currently being ignored. |  |
| Is jumping | Check if the character is currently moving upward from a jump. |  |
| Is moving | Check if the character is moving at all. |  |
| Is on ceiling | Check if the character is touching a ceiling. |  |
| Is on floor | Check if the character is standing on the ground. |  |
| Is on wall | Check if the character is touching a wall. | Side *(combo)* <br> |
| Is wall sliding | Check if the character is sliding down a wall. |  |
| On double jumped | Triggered when the character uses an extra mid-air jump. |  |
| On facing changed | Triggered when the character turns around. |  |
| On fallen off | Triggered when the character walks off a ledge. |  |
| On jumped | Triggered every time the character jumps. |  |
| On landed | Triggered when the character touches the ground after being in the air. |  |
| On wall jumped | Triggered when the character jumps off a wall. |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| Acceleration | The current acceleration rate. | number |  | 
| AirTime | Seconds the character has been in the air. 0 on the ground. | number |  | 
| Deceleration | The current deceleration rate. | number |  | 
| FacingDirection | Which way the character faces: -1 = left, 1 = right. | number |  | 
| Gravity | The current extra gravity pull. | number |  | 
| JumpsRemaining | How many jumps the character has left before landing. | number |  | 
| JumpStrength | The current jump power. | number |  | 
| MaxFallSpeed | The current maximum falling speed. | number |  | 
| MaxSpeed | The current top speed limit. | number |  | 
| MovingAngle | The angle the character is moving in degrees. | number |  | 
| Speed | Current movement speed in px/s (magnitude of velocity vector). | number |  | 
| VectorX | Current horizontal Physics velocity (px/s). Positive = right. | number |  | 
| VectorY | Vertical speed. Positive = falling, negative = rising. | number |  | 
| WallContactSide | Side of the most recent wall contact: -1 = left wall, 1 = right wall, 0 = no wall. | number |  | 


---
## Changelog

**1.1.0.1**

**1.1.0.0**
- **Added:** Initial feature spec for the Addon.

**0.0.0.0**
- **Added:** Initial release.
