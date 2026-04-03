export const config = {
  listName: "Set gravity",
  displayText: "Set gravity to {0}",
  description: "Change how strongly the character is pulled down.",
  params: [
    {
      id: "gravity",
      name: "Gravity",
      desc: "Extra downward pull. 0 = use Physics gravity only.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (gravity) {
  this._gravity = gravity;
}
