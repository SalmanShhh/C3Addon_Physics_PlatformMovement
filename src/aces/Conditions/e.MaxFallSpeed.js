export const config = {
  returnType: "number",
  description: "Current Max Fall Speed setting (px/s).",
  params: [],
};

export const expose = true;

export default function () {
  return this._maxFallSpeed;
}
