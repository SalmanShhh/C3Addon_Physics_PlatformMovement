export const config = {
  returnType: "number",
  description: "Seconds left in the wall coyote window. Use to show a brief visual cue that a wall jump is still possible.",
  params: [],
};

export const expose = false;

export default function () {
  return this._wallCoyoteTimer;
}
