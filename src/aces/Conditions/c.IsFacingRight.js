export const config = {
  listName: "Is facing right",
  displayText: "Is facing right",
  description: "Check if the character is facing right. Invert for facing left.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._facing === 1;
}
