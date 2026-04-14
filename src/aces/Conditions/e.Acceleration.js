export const config = {
  returnType: "number",
  description: "Current Acceleration setting (px/s²).",
  params: [],
};

export const expose = true;

export default function () {
  return this._acceleration;
}
