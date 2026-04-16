export const config = {
  listName: "Set variable jump height",
  displayText: "Set variable jump height to {0}",
  description: "Tap for a short hop, hold for a full jump. Disable for a fixed jump height every time.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Whether variable jump height is active.",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this.setVariableJumpHeight(enabled);
}
