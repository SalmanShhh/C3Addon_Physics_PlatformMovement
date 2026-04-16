export const config = {
  listName: "Set max jumps",
  displayText: "Set max jumps to {0}",
  description: "How many times the character can jump before touching the ground. Set to 2 to unlock double jump.",
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
  this.setMaxJumps(count);
}
