export const config = {
  listName: "Set contact grace duration",
  displayText: "Set contact grace to {0} second(s)",
  description:
    "Set how long (in seconds) a floor, wall, or ceiling contact must be absent before that state clears. Higher values reduce contact jitter at the cost of slightly delayed state transitions. Default: 0.05 s (~3 frames at 60 fps).",
  params: [
    {
      id: "duration",
      name: "Duration",
      desc: "Grace duration in seconds. Contact must be absent for this long before the state clears (min 0).",
      type: "number",
      initialValue: "0.05",
    },
  ],
};

export const expose = true;

export default function (duration) {
  this.setContactGrace(duration);
}
