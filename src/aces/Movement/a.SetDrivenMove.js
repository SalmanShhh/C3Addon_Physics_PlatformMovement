export const config = {
  listName: "Apply driven movement",
  displayText: "Apply driven movement to ({0}, {1}) for {2}s",
  description: "Take control of the character's movement and lock player input for a short time. Use for dashes, heavy knockback, or launch pads.",
  params: [
    {
      id: "vx",
      name: "Vector X",
      desc: "Horizontal velocity in px/s. Positive = right.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "vy",
      name: "Vector Y",
      desc: "Vertical velocity in px/s. Negative = up.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "duration",
      name: "Duration",
      desc: "Seconds to suppress player input.",
      type: "number",
      initialValue: "0.2",
    },
  ],
};

export const expose = true;

export default function (vx, vy, duration) {
  this.drivenVelocity(vx, vy, duration);
}
