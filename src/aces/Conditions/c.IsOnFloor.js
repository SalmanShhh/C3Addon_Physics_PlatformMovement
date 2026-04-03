export const config = {
  listName: "Is on floor",
  displayText: "Is on floor",
  description: "Check if the character is standing on the ground.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._onFloor;
}
