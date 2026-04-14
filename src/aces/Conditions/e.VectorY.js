export const config = {
  returnType: "number",
  description: "Current vertical Physics velocity (px/s). Positive = down.",
  params: [],
};

export const expose = true;

export default function () {
  return this._phys ? this._phys.getVelocityY() : 0;
}
