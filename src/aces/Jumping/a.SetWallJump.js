export const config = {
  listName: "Set wall jump",
  displayText: "Set wall jump to {0}",
  description: "Toggle the ability to jump off walls.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Enable wall jumping.",
      type: "boolean",
      initialValue: "false",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this.setWallJump(enabled);
}
