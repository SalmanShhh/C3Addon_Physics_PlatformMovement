export const config = {
  listName: "Set wall slide speed",
  displayText: "Set wall slide speed to {0}",
  description: "How fast the character slides down a wall. Lower = slower, more controlled. e.g. set very low for a sticky-wall ability.",
  params: [
    {
      id: "speed",
      name: "Speed",
      desc: "Maximum fall speed (px/s) while wall sliding.",
      type: "number",
      initialValue: "80",
    },
  ],
};

export const expose = true;

export default function (speed) {
  this.setWallSlideSpeed(speed);
}
