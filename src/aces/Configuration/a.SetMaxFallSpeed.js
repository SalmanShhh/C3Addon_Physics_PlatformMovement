export const config = {
  listName: "Set max fall speed",
  displayText: "Set max fall speed to {0}",
  description: "Change the maximum fall speed the character can reach.",
  params: [
    {
      id: "speed",
      name: "Speed",
      desc: "Maximum falling speed in px/s.",
      type: "number",
      initialValue: "1000",
    },
  ],
};

export const expose = true;

export default function (speed) {
  this._maxFallSpeed = speed;
}
