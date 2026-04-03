export const config = {
  returnType: "number",
  description: "Vertical speed. Positive = falling, negative = rising.",
  params: [],
};

export const expose = true;

export default function () {
  return this._phys ? this._phys.getVelocityY() : 0;
}
