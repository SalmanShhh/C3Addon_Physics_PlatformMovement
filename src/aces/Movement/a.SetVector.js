export const config = {
  listName: "Set vector",
  displayText: "Set vector to ({0}, {1})",
  description: "Set horizontal and vertical speed at once.",
  params: [
    {
      id: "vectorX",
      name: "Vector X",
      desc: "Horizontal speed. Positive = right.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "vectorY",
      name: "Vector Y",
      desc: "Vertical speed. Negative = up.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (vectorX, vectorY) {
  if (this._phys) {
    this._phys.setVelocity(vectorX, vectorY);
  }
}
