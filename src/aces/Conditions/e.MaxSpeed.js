export const config = {
  returnType: "number",
  description: "Current Max Speed setting (px/s).",
  params: [],
};

export const expose = true;

export default function () {
  return this._maxSpeed;
}
