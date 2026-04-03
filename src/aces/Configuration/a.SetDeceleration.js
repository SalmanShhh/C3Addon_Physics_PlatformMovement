export const config = {
  listName: "Set deceleration",
  displayText: "Set deceleration to {0}",
  description: "Change how quickly the character slows down.",
  params: [
    {
      id: "decel",
      name: "Deceleration",
      desc: "How fast to come to a stop.",
      type: "number",
      initialValue: "1500",
    },
  ],
};

export const expose = true;

export default function (decel) {
  this._deceleration = decel;
}
