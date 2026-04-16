export const config = {
  listName: "Is wall sliding",
  displayText: "Is wall sliding",
  description: "True while sliding down a wall.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._isWallSliding;
}
