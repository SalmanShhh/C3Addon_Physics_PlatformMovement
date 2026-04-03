export const config = {
  listName: "Is moving",
  displayText: "Is moving",
  description: "Check if the character is moving at all.",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  if (!this._phys) return false;
  const vx = this._phys.getVelocityX();
  const vy = this._phys.getVelocityY();
  return Math.sqrt(vx * vx + vy * vy) > 0.5;
}
