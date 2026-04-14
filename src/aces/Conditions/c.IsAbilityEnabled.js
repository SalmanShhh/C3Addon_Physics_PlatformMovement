export const config = {
  listName: "Is Movement Ability enabled",
  displayText: "Is {0} enabled",
  description: "Check if a specific platformer ability is currently enabled.",
  isInvertible: true,
  params: [
    {
      id: "ability",
      name: "Ability",
      desc: "The ability to check.",
      type: "combo",
      initialValue: "coyote_time",
      items: [
        { coyote_time: "Coyote Time" },
        { wall_sliding: "Wall Sliding" },
        { wall_jump: "Wall Jump" },
        { variable_jump: "Variable Jump" },
      ],
    },
  ],
};

export const expose = true;

export default function (ability) {
  const keys = ["coyote_time", "wall_sliding", "wall_jump", "variable_jump"];
  const key = keys[ability] ?? keys[0];
  switch (key) {
    case "coyote_time":   return this._coyoteTime > 0;
    case "wall_sliding":  return this._wallSlide;
    case "wall_jump":     return this._wallJump;
    case "variable_jump": return this._variableJump;
    default: return false;
  }
}
