export const config = {
  listName: "Set jump release damping",
  displayText: "Set jump release damping to {0}%",
  description: "Control how much shorter a jump is when the button is released early.",
  params: [
    {
      id: "percent",
      name: "Damping %",
      desc: "How much upward speed to keep (0-100). Lower = shorter jump on release.",
      type: "number",
      initialValue: "50",
    },
  ],
};

export const expose = true;

export default function (percent) {
  this._jumpReleaseDamping = Math.max(0, Math.min(100, percent)) / 100;
}
