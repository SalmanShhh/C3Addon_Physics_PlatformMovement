export const config = {
  listName: "Set wall coyote time",
  displayText: "Set wall coyote time to {0}",
  description: "How long after leaving a wall the player can still wall jump. Forgives slightly late button presses. Set to 0 to disable.",
  params: [
    {
      id: "time",
      name: "Time",
      desc: "Wall coyote time duration in seconds.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (time) {
  this.setWallCoyoteTime(time);
}
