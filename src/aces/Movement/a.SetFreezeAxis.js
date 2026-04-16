export const config = {
  listName: "Set freeze axis",
  displayText: "Freeze {0} axis: {1}",
  description: "Lock movement on one or both axes.",
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
  this.setFreezeAxis(axis, freeze);
}
