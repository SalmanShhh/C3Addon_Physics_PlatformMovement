export const config = {
  listName: "Set wall jump input lock",
  displayText: "Set wall jump input lock to {0} second(s)",
  description: "How long input toward the wall is ignored after a wall jump. 0 = no lock.",
  params: [
    {
      id: "time",
      name: "Time",
      desc: "Lock duration in seconds (min 0).",
      type: "number",
      initialValue: "0.15",
    },
  ],
};

export const expose = true;

export default function (time) {
  this.setWallJumpLock(time);
}
