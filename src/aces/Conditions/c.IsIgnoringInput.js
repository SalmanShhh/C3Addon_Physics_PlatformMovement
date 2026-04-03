export const config = {
  listName: "Is ignoring input",
  displayText: "Is ignoring input",
  description: "Check if input is currently being ignored.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._ignoreInput;
}
