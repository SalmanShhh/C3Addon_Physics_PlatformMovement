export const config = {
  returnType: "number",
  description: "Which way the character faces: -1 = left, 1 = right.",
  params: [],
};

export const expose = true;

export default function () {
  return this._facing;
}
