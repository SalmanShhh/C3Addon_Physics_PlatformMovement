export const config = {
  listName: "Set on floor",
  displayText: "Set on floor to {0}",
  description: "Force the character to be treated as grounded this tick. Use with moving platforms where Physics contact alone is unreliable.",
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
