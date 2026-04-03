export const config = {
  returnType: "number",
  description: "The current acceleration rate.",
  params: [],
};

export const expose = true;

export default function () {
  return this._acceleration;
}
