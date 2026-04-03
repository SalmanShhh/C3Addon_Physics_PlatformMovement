export const config = {
  listName: "Is on ceiling",
  displayText: "Is on ceiling",
  description: "Check if the character is touching a ceiling.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._onCeiling;
}
