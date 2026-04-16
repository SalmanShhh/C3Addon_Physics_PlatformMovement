export const config = {
  listName: "Is jumping",
  displayText: "Is jumping",
  description: "True while the character is moving upward after a jump.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  if (!this._phys) return false;
  return !this._onFloor && this._phys.getVelocityY() < 0;
}
