export const config = {
  listName: "Is enabled",
  displayText: "Is enabled",
  description: "Check if the behavior is currently active.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._enabled;
}
