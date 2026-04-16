export const config = {
  listName: "Set jump buffer",
  displayText: "Set jump buffer to {0}",
  description: "How early before landing a jump press is accepted. Prevents missed jumps when the button is pressed slightly too soon. Set to 0 to disable.",
  params: [
    {
      id: "time",
      name: "Time",
      desc: "Jump buffer duration in seconds.",
      type: "number",
      initialValue: "0.1",
    },
  ],
};

export const expose = true;

export default function (time) {
  this.setJumpBuffer(time);
}
