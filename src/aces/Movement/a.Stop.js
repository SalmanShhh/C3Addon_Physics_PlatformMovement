export const config = {
  listName: "Stop",
  displayText: "Stop",
  description: "Instantly stop all movement.",
  params: [],
};

export const expose = true;

export default function () {
  this.stop();
}
