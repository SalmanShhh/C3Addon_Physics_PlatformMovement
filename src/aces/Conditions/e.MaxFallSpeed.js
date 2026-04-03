export const config = {
  returnType: "number",
  description: "The current maximum falling speed.",
  params: [],
};

export const expose = true;

export default function () {
  return this._maxFallSpeed;
}
