export const config = {
  returnType: "number",
  description: "The current top speed limit.",
  params: [],
};

export const expose = true;

export default function () {
  return this._maxSpeed;
}
