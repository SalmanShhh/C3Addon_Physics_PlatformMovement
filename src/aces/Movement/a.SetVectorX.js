export const config = {
  listName: "Set vector X",
  displayText: "Set vector X to {0}",
  description: "Directly set the horizontal Physics velocity (px/s).",
  params: [
    {
      id: "vectorX",
      name: "Vector X",
      desc: "New horizontal velocity in px/s.",
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
