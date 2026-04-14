export const config = {
  returnType: "number",
  description: "Current Jump Strength setting.",
  params: [],
};

export const expose = true;

export default function () {
  return this._jumpStrength;
}
