export const config = {
  returnType: "number",
  description:
    "The current contact grace duration in seconds — how long a floor, wall, or ceiling contact must be absent before that state clears.",
  params: [],
};

export const expose = true;

export default function () {
  return this._contactGrace;
}
