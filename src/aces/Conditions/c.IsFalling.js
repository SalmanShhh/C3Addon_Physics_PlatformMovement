export const config = {
  listName: "Is falling",
  displayText: "Is falling",
  description: "Check if the character is falling through the air.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  if (!this._phys) return false;
  return !this._onFloor && this._phys.getVelocityY() > 0;
}
