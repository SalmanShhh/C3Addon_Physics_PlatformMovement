export const config = {
  listName: "Set max fall speed",
  displayText: "Set max fall speed to {0}",
  description: "Change the fastest the character can fall.",
  params: [
    {
      id: "speed",
      name: "Speed",
      desc: "Maximum falling speed.",
      type: "number",
      initialValue: "1000",
    },
  ],
};

export const expose = true;

export default function (speed) {
  this._maxFallSpeed = speed;
}
