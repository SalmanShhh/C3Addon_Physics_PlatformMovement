export const config = {
  listName: "Apply knockback",
  displayText: "Apply knockback ({0}, {1}) for {2}s",
  description: "Set the velocity and suppress all movement input for the given duration. Gravity, wall slide, and max fall speed still apply during knockback.",
  params: [
    {
      id: "vx",
      name: "Vector X",
      desc: "Horizontal knockback velocity in px/s (positive = right, negative = left).",
      type: "number",
      initialValue: "0",
    },
    {
      id: "vy",
      name: "Vector Y",
      desc: "Vertical knockback velocity in px/s (positive = down, negative = up).",
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
  this.knockback(vx, vy, duration);
}
