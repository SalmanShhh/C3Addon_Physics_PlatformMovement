export const config = {
  returnType: "number",
  description: "The angle the character is moving in degrees.",
  params: [],
};

export const expose = true;

export default function () {
  if (!this._phys) return 0;
  const vx = this._phys.getVelocityX();
  const vy = this._phys.getVelocityY();
  if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001) return 0;
  return (Math.atan2(vy, vx) * 180) / Math.PI;
}
