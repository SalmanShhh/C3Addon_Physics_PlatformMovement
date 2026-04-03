export const config = {
  listName: "Set vector Y",
  displayText: "Set vector Y to {0}",
  description: "Directly set the vertical Physics velocity (px/s).",
  params: [
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

export default function (vectorY) {
  if (this._phys) {
    this._phys.setVelocity(this._phys.getVelocityX(), vectorY);
  }
}
