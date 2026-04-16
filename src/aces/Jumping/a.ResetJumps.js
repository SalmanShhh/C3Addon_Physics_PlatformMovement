export const config = {
  listName: "Reset jumps",
  displayText: "Reset jumps",
  description: "Give all jumps back, as if the character just landed.",
  params: [],
};

export const expose = true;

export default function () {
  this.resetJumps();
}
