export const config = {
  listName: "Set freeze axis",
  displayText: "Freeze {0} axis: {1}",
  description: "Lock an axis so the character cannot move on it.",
  params: [
    {
      id: "axis",
      name: "Axis",
      desc: "Which axis to freeze or unfreeze.",
      type: "combo",
      initialValue: "both",
      items: [
        { horizontal: "Horizontal (X)" },
        { vertical: "Vertical (Y)" },
        { both: "Both" },
      ],
    },
    {
      id: "freeze",
      name: "Freeze",
      desc: "Check to freeze, uncheck to unfreeze.",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (axis, freeze) {
  const keys = ["horizontal", "vertical", "both"];
  const key = keys[axis] || keys[2];
  const val = freeze ? true : false;
  if (key === "horizontal" || key === "both") this._freezeX = val;
  if (key === "vertical" || key === "both") this._freezeY = val;
}
