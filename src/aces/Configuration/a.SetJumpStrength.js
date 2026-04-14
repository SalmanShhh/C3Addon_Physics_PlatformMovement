export const config = {
  listName: "Set jump strength",
  displayText: "Set jump strength to {0}",
  description: "Change how high the character jumps.",
  params: [
    {
      id: "strength",
      name: "Strength",
      desc: "New jump impulse in px/s.",
      type: "number",
      initialValue: "600",
    },
  ],
};

export const expose = true;

export default function (strength) {
  this.setJumpStrength(strength);
}
