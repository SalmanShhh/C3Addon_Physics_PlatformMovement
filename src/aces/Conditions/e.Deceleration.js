export const config = {
  returnType: "number",
  description: "The current deceleration rate.",
  params: [],
};

export const expose = true;

export default function () {
  return this._deceleration;
}
