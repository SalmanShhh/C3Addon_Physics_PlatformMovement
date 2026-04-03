export const config = {
  listName: "Set deceleration",
  displayText: "Set deceleration to {0}",
  description: "Override Deceleration at runtime.",
  params: [
    {
      id: "decel",
      name: "Deceleration",
      desc: "New deceleration in px/s².",
      type: "number",
      initialValue: "1500",
    },
  ],
};

export const expose = true;

export default function (decel) {
  this._deceleration = decel;
}
