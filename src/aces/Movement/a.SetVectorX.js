export const config = {
  listName: "Set vector X",
  displayText: "Set vector X to {0}",
  description: "Set the horizontal speed directly.",
  params: [
    {
      id: "vectorX",
      name: "Vector X",
      desc: "Horizontal speed. Positive = right.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (vectorX) {
  if (this._phys) {
    this._phys.setVelocity(vectorX, this._phys.getVelocityY());
  }
}
