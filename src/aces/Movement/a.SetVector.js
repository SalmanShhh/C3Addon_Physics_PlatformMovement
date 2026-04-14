export const config = {
  listName: "Set vector",
  displayText: "Set vector to ({0}, {1})",
  description: "Set horizontal and vertical speed in px/s.",
  params: [
    {
      id: "vectorX",
      name: "Vector X",
      desc: "Horizontal speed in px/s",
      type: "number",
      initialValue: "0",
    },
    {
      id: "vectorY",
      name: "Vector Y",
      desc: "New vertical velocity in px/s. Use negative values to move upward.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (vectorX, vectorY) {
  this.setVector(vectorX, vectorY);
}
