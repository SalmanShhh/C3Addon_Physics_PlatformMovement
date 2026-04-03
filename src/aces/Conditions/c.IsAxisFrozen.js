export const config = {
  listName: "Is axis frozen",
  displayText: "Is {0} axis frozen",
  description: "Check if an axis is currently frozen.",
  isInvertible: true,
  params: [
    {
      id: "axis",
      name: "Axis",
      desc: "Which axis to check.",
      type: "combo",
      initialValue: "horizontal",
      items: [
        { horizontal: "Horizontal (X)" },
        { vertical: "Vertical (Y)" },
      ],
    },
  ],
};

export const expose = true;

export default function (axis) {
  const keys = ["horizontal", "vertical"];
  const key = keys[axis] || keys[0];
  if (key === "horizontal") return this._freezeX;
  return this._freezeY;
}
