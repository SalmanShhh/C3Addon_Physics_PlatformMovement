export const config = {
  listName: "Set jump release damping",
  displayText: "Set jump release damping to {0}%",
  description: "Set the percentage of upward velocity retained when the jump button is released early. Lower values give more control over jump height.",
  params: [
    {
      id: "percent",
      name: "Damping %",
      desc: "Percentage of upward velocity to keep on jump release (0-100). Default is 50.",
      type: "number",
      initialValue: "50",
    },
  ],
};

export const expose = true;

export default function (percent) {
  this._jumpReleaseDamping = Math.max(0, Math.min(100, percent)) / 100;
}
