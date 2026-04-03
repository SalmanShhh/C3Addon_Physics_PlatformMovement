export const config = {
  listName: "Stop",
  displayText: "Stop",
  description: "Instantly stop all movement.",
  params: [],
};

export const expose = true;

export default function () {
  if (this._phys) {
    this._phys.setVelocity(0, 0);
  }
}
