export const config = {
  returnType: "number",
  description:
    "Approximate outward floor surface normal Y component. Negative = upward (C3 Y increases downward). -1 on flat ground. Retains the last valid value while airborne.",
  params: [],
};

export const expose = true;

export default function () {
  return this._floorNormalY;
}
