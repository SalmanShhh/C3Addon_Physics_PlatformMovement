export const config = {
  listName: "Is axis frozen",
  displayText: "Is {0} axis frozen",
  description: "True if the chosen axis is currently locked. Use to check whether a stasis or freeze effect is still active.",
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
