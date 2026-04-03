export const config = {
  returnType: "number",
  description: "How many jumps the character has left before landing.",
  params: [],
};

export const expose = true;

export default function () {
  return this._jumpsRemaining;
}
