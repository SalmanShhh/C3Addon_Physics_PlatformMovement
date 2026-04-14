export const config = {
  listName: "Apply impulse",
  displayText: "Apply impulse ({0}, {1})",
  description: "Add an instantaneous velocity impulse to the current Physics velocity. The behavior's deceleration will naturally taper it off.",
  params: [
    {
      id: "vx",
      name: "Vector X",
      desc: "Horizontal impulse in px/s (positive = right, negative = left).",
      type: "number",
      initialValue: "0",
    },
    {
      id: "vy",
      name: "Vector Y",
      desc: "Vertical impulse in px/s (positive = down, negative = up).",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (vx, vy) {
  this.applyImpulse(vx, vy);
}
