export const config = {
  returnType: "number",
  description: "Seconds the character has been in the air. 0 on the ground.",
  params: [],
};

export const expose = true;

export default function () {
  return this._airTime;
}
