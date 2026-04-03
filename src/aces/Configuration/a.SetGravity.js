export const config = {
  listName: "Set gravity",
  displayText: "Set gravity to {0}",
  description: "Override the additional downward gravity (px/s²) at runtime.",
  params: [
    {
      id: "gravity",
      name: "Gravity",
      desc: "Extra downward pull acceleration in px/s². (0 = use Physics gravity only).",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (gravity) {
  this._gravity = gravity;
}
