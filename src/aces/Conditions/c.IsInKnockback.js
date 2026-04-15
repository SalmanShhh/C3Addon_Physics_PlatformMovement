export const config = {
  listName: "Is in knockback",
  displayText: "Is in knockback",
  description: "Check if the character is currently in a knockback state (input suppressed by a knockback call).",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._knockbackTimer > 0;
}
