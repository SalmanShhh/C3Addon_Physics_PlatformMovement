export const config = {
  listName: "Set acceleration",
  displayText: "Set acceleration to {0}",
  description: "Change how quickly the character speeds up.",
  params: [
    {
      id: "accel",
      name: "Acceleration",
      desc: "How fast to reach top speed.",
      type: "number",
      initialValue: "1500",
    },
  ],
};

export const expose = true;

export default function (accel) {
  this._acceleration = accel;
}
