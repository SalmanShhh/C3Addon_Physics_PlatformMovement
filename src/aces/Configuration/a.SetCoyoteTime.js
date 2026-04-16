export const config = {
  listName: "Set coyote time",
  displayText: "Set coyote time to {0}",
  description: "How long after walking off a ledge the player can still jump. Makes platforming more forgiving. Set to 0 to disable.",
  params: [
    {
      id: "time",
      name: "Time",
      desc: "Coyote time duration in seconds.",
      type: "number",
      initialValue: "0.1",
    },
  ],
};

export const expose = true;

export default function (time) {
  this.setCoyoteTime(time);
}
