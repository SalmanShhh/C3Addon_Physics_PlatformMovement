export const config = {
  listName: "Set wall jump strength",
  displayText: "Set wall jump strength to {0}",
  description: "How far the character pushes away from the wall on a wall jump. Higher = wider arc — use to tune the feel of vertical shaft climbing.",
  params: [
    {
      id: "strength",
      name: "Strength",
      desc: "Horizontal wall jump impulse in px/s.",
      type: "number",
      initialValue: "450",
    },
  ],
};

export const expose = true;

export default function (strength) {
  this.setWallJumpStrength(strength);
}
