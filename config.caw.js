import {
  ADDON_CATEGORY,
  ADDON_TYPE,
  PLUGIN_TYPE,
  PROPERTY_TYPE,
} from "./template/enums.js";
import _version from "./version.js";
export const addonType = ADDON_TYPE.BEHAVIOR;
export const type = PLUGIN_TYPE.OBJECT;
export const id = "salmanshh_platformer_physics";
export const name = "Platformer Physics";
export const version = _version;
export const minConstructVersion = undefined;
export const author = "SalmanShh";
export const website = "https://www.construct.net";
export const documentation = "https://www.construct.net";
export const description = "Platform-style movement driven by the Physics engine — run, jump, wall-slide, and interact with rigid bodies.";
export const category = ADDON_CATEGORY.MOVEMENTS;

export const hasDomside = false;
export const files = {
  extensionScript: {
    enabled: false, // set to false to disable the extension script
    watch: true, // set to true to enable live reload on changes during development
    targets: ["x86", "x64"],
    // you don't need to change this, the build step will rename the dll for you. Only change this if you change the name of the dll exported by Visual Studio
    name: "MyExtension",
  },
  fileDependencies: [],
  remoteFileDependencies: [
    // {
    //   src: "https://example.com/api.js", // Must use https:// or same-protocol // URLs. http:// is not allowed.
    //   type: "" // Optional: "" or "module". Empty string or omit for classic script.
    // }
  ],
  cordovaPluginReferences: [],
  cordovaResourceFiles: [],
};

export const aceCategories = {
  Movement: "Movement",
  Jumping: "Jumping",
  Conditions: "Conditions",
  Configuration: "Configuration",
};

export const info = {
  Set: {
    CanBeBundled: true,
    IsDeprecated: false,
    GooglePlayServicesEnabled: false,
    IsOnlyOneAllowed: true,
    IsResizable: false,
    IsRotatable: false,
    Is3D: false,
    HasImage: false,
    IsTiled: false,
    SupportsZElevation: false,
    SupportsColor: false,
    SupportsEffects: false,
    MustPreDraw: false,
    IsSingleGlobal: false,
  },
  AddCommonACEs: {
    Position: false,
    SceneGraph: false,
    Size: false,
    Angle: false,
    Appearance: false,
    ZOrder: false,
  },
};

export const properties = [
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "maxSpeed",
    name: "Max Speed",
    desc: "Maximum horizontal movement speed in px/s.",
    options: { initialValue: 200 },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "acceleration",
    name: "Acceleration",
    desc: "Rate at which horizontal velocity increases toward Max Speed (px/s²).",
    options: { initialValue: 1500 },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "deceleration",
    name: "Deceleration",
    desc: "Rate at which horizontal velocity decreases to zero when no input is given (px/s²).",
    options: { initialValue: 1500 },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "jumpStrength",
    name: "Jump Strength",
    desc: "Upward impulse magnitude applied when a jump executes (px/s).",
    options: { initialValue: 600 },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "gravity",
    name: "Gravity",
    desc: "Additional downward acceleration (px/s²) applied per tick on top of Physics world gravity.",
    options: { initialValue: 0 },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "maxFallSpeed",
    name: "Max Fall Speed",
    desc: "Terminal velocity clamp (px/s downward).",
    options: { initialValue: 1000 },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "defaultControls",
    name: "Default Controls",
    desc: "When true, the behavior reads Arrow Left/Right, A/D, and Space/Up/W from the runtime keyboard each tick.",
    options: { initialValue: true },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "slopeTolerance",
    name: "Slope Tolerance",
    desc: "Contact classification threshold as a fraction of half-height below center to count as floor.",
    options: { initialValue: 0.35 },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "coyoteTime",
    name: "Coyote Time",
    desc: "Seconds after leaving a floor edge during which a jump is still allowed.",
    options: { initialValue: 0.1 },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "jumpBuffer",
    name: "Jump Buffer",
    desc: "Seconds a jump input is remembered before landing.",
    options: { initialValue: 0.1 },
  },
  {
    type: PROPERTY_TYPE.INTEGER,
    id: "maxJumps",
    name: "Max Jumps",
    desc: "Total jumps allowed per airborne period. 1 = single jump, 2 = double jump.",
    options: { initialValue: 1 },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "wallSlide",
    name: "Wall Slide",
    desc: "Clamp fall speed to Wall Slide Speed when pressing into a wall while airborne.",
    options: { initialValue: false },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "wallSlideSpeed",
    name: "Wall Slide Speed",
    desc: "Maximum downward speed (px/s) while wall sliding.",
    options: { initialValue: 80 },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "wallJump",
    name: "Wall Jump",
    desc: "Allow jumping off a wall.",
    options: { initialValue: false },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id: "wallJumpStrength",
    name: "Wall Jump Strength",
    desc: "Horizontal impulse component of a wall jump.",
    options: { initialValue: 450 },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "variableJumpHeight",
    name: "Variable Jump Height",
    desc: "Releasing jump early dampens upward velocity, giving short/tall jump variation.",
    options: { initialValue: true },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id: "debugMode",
    name: "Debug Mode",
    desc: "Print contact classification and velocity state to the browser console each tick.",
    options: { initialValue: false },
  },
];
