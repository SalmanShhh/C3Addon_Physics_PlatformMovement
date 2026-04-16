export const config = {
  listName: "Can jump",
  displayText: "Can jump",
  description: "True when a jump is possible right now (on ground, in coyote window, or has jumps left).",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._onFloor || this._coyoteTimer > 0 || this._jumpsRemaining > 0;
}
