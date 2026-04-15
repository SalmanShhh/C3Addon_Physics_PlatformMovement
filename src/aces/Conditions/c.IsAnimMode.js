export const config = {
  listName: "Compare animation mode",
  displayText: "Animation mode is {0}",
  description: "Check the current animation mode.",
  isInvertible: true,
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "The animation mode to compare against.",
      type: "combo",
      initialValue: "idle",
      items: [
        { idle: "Idle" },
        { moving: "Moving" },
        { jumping: "Jumping" },
        { falling: "Falling" },
        { wall_sliding: "Wall sliding" },
        { disabled: "Disabled" },
      ],
    },
  ],
};

export const expose = false;

const _modeKeys = ["idle", "moving", "jumping", "falling", "wall_sliding", "disabled"];
const _modeLabels = ["Idle", "Moving", "Jumping", "Falling", "Wall sliding", "Disabled"];

export default function (modeIndex) {
  const label = _modeLabels[modeIndex] ?? "Idle";
  return this.animMode === label;
}
