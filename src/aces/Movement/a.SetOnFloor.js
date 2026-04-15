export const config = {
  listName: "Set on floor",
  displayText: "Set on floor to {0}",
  description:
    "Override the floor contact state for this tick. Useful for moving platforms or custom collision logic. Setting true also resets jumps remaining and clears coyote/air timers as if the character just landed.",
  params: [
    {
      id: "onFloor",
      name: "On floor",
      desc: "True to force the character to be considered on the floor.",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (onFloor) {
  this.setOnFloor(onFloor);
}
