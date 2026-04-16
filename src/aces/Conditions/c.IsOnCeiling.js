export const config = {
  listName: "Is on ceiling",
  displayText: "Is on ceiling",
  description: "True when touching a ceiling. Use to cut upward velocity when the character bumps their head.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._onCeiling;
}
