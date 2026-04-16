export const config = {
  listName: "Set deceleration",
  displayText: "Set deceleration to {0}",
  description: "How quickly the character stops when releasing input. Low = icy sliding, high = instant stop.",
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
  this.setDeceleration(decel);
}
