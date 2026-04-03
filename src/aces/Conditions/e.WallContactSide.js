export const config = {
  returnType: "number",
  description: "Which wall the character is touching: -1 = left, 1 = right, 0 = none.",
  params: [],
};

export const expose = true;

export default function () {
  return this._wallContactSide;
}
