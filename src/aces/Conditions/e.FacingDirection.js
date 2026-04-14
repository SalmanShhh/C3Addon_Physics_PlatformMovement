export const config = {
  returnType: "number",
  description: "Current facing as a signed number: -1 = left, 1 = right.",
  params: [],
};

export const expose = true;

export default function () {
  return this._facing;
}
