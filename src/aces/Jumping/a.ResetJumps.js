export const config = {
  listName: "Reset jumps",
  displayText: "Reset jumps",
  description: "Give back all jumps as if the character just landed.",
  params: [],
};

export const expose = true;

export default function () {
  this._jumpsRemaining = this._maxJumps;
}
