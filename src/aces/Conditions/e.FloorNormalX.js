export const config = {
  returnType: "number",
  description:
    "Approximate outward floor surface normal X component. Derived from contact point offsets — accurate for flat and gently sloped surfaces. Retains the last valid value while airborne. 0 before first ground contact.",
  params: [],
};

export const expose = true;

export default function () {
  return this._floorNormalX;
}
