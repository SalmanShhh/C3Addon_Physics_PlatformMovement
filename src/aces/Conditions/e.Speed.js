export const config = {
  returnType: "number",
  description: "The character's overall speed.",
  params: [],
};

export const expose = true;

export default function () {
  if (!this._phys) return 0;
  const vx = this._phys.getVelocityX();
  const vy = this._phys.getVelocityY();
  return Math.sqrt(vx * vx + vy * vy);
}
