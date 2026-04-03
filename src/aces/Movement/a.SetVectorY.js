export const config = {
  listName: "Set vector Y",
  displayText: "Set vector Y to {0}",
  description: "Set the vertical speed directly.",
  params: [
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

export default function (vectorY) {
  if (this._phys) {
    this._phys.setVelocity(this._phys.getVelocityX(), vectorY);
  }
}
