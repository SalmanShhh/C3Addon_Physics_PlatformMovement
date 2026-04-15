export const config = {
  listName: "Set driven move",
  displayText: "Set driven move ({0}, {1}) for {2}s",
  description: "Temporarily drives the character at the given velocity, suppressing movement input for the duration. Use for dashes, knockback, launch pads, or any externally driven movement. Gravity, wall slide, and max fall speed still apply.",
  params: [
    {
      id: "vx",
      name: "Vector X",
      desc: "Horizontal driven velocity in px/s (positive = right, negative = left). Use for dashes or sideways knockback.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "vy",
      name: "Vector Y",
      desc: "Vertical driven velocity in px/s (positive = down, negative = up). Use for launches or upward knockback.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "duration",
      name: "Duration",
      desc: "How long in seconds to suppress movement input.",
      type: "number",
      initialValue: "0.3",
    },
  ],
};

export const expose = true;

export default function (vx, vy, duration) {
  this.drivenVelocity(vx, vy, duration);
}
