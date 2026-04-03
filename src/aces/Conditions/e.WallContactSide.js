export const config = {
  returnType: "number",
  description: "Side of the most recent wall contact: -1 = left wall, 1 = right wall, 0 = no wall.",
  params: [],
};

export const expose = true;

export default function () {
  return this._wallContactSide;
}
