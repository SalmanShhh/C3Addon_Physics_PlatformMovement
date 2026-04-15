export const config = {
  listName: "Is driven moving",
  displayText: "Is driven moving",
  description: "True while the character is being externally driven (input suppressed by a Set Driven Move call). Use to block other actions during dashes, knockback, or launches.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._drivenTimer > 0;
}
