export const config = {
  returnType: "number",
  description:
    "Approximate outward floor surface normal as an angle in degrees (0–360, clockwise from right). 270° on flat ground (normal points straight up). Retains the last valid value while airborne.",
  params: [],
};

export const expose = true;

export default function () {
  const deg = Math.atan2(this._floorNormalY, this._floorNormalX) * (180 / Math.PI);
  return ((deg % 360) + 360) % 360;
}
