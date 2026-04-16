export const config = {
  listName: "Is driven moving",
  displayText: "Is driven moving",
  description: "True while a driven move (e.g. dash or knockback) is in progress. Use to lock out other actions until it finishes.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._drivenTimer > 0;
}
