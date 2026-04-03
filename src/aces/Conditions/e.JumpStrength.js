export const config = {
  returnType: "number",
  description: "The current jump power.",
  params: [],
};

export const expose = true;

export default function () {
  return this._jumpStrength;
}
