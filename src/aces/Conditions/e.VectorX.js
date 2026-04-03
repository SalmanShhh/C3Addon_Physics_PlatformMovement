export const config = {
  returnType: "number",
  description: "Horizontal speed. Positive = right, negative = left.",
  params: [],
};

export const expose = true;

export default function () {
  return this._phys ? this._phys.getVelocityX() : 0;
}
