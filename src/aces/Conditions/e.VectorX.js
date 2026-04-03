export const config = {
  returnType: "number",
  description: "Current horizontal Physics velocity (px/s). Positive = right.",
  params: [],
};

export const expose = true;

export default function () {
  return this._phys ? this._phys.getVelocityX() : 0;
}
