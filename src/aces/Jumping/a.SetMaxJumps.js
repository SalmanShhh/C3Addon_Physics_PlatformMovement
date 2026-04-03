export const config = {
  listName: "Set max jumps",
  displayText: "Set max jumps to {0}",
  description: "Set how many times the character can jump before landing.",
  params: [
    {
      id: "count",
      name: "Count",
      desc: "1 = normal, 2 = double jump, etc.",
      type: "number",
      initialValue: "1",
    },
  ],
};

export const expose = true;

export default function (count) {
  this._maxJumps = Math.max(0, Math.floor(count));
}
