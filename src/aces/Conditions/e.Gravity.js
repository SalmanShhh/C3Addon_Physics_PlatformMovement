export const config = {
  returnType: "number",
  description: "The current extra gravity pull.",
  params: [],
};

export const expose = true;

export default function () {
  return this._gravity;
}
