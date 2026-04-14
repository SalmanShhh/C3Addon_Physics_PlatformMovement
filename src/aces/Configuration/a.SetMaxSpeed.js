export const config = {
  listName: "Set max speed",
  displayText: "Set max speed to {0}",
  description: "Change the top running speed.",
  params: [
    {
      id: "speed",
      name: "Speed",
      desc: "New top speed in pixels per second.",
      type: "number",
      initialValue: "200",
    },
  ],
};

export const expose = true;

export default function (speed) {
  this.setMaxSpeed(speed);
}
