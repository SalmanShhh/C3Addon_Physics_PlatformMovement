export const config = {
  listName: "Is jumping",
  displayText: "Is jumping",
  description: "Check if the character is currently moving upward from a jump.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  if (!this._phys) return false;
  return !this._onFloor && this._phys.getVelocityY() < 0;
}
