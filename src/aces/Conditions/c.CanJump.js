export const config = {
  listName: "Can jump",
  displayText: "Can jump",
  description: "Check if the character is able to jump right now.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._onFloor || this._coyoteTimer > 0 || this._jumpsRemaining > 0;
}
