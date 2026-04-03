export const config = {
  listName: "Is on wall",
  displayText: "Is on wall ({0})",
  description: "Check if the character is touching a wall.",
  isInvertible: true,
  params: [
    {
      id: "side",
      name: "Side",
      desc: "Which side to check.",
      type: "combo",
      initialValue: "either",
      items: [
        { left: "Left" },
        { right: "Right" },
        { either: "Either" },
      ],
    },
  ],
};

export const expose = true;

export default function (side) {
  const keys = ["left", "right", "either"];
  const key = keys[side] || keys[0];
  switch (key) {
    case "left": return this._onWallLeft;
    case "right": return this._onWallRight;
    case "either": return this._onWallLeft || this._onWallRight;
    default: return false;
  }
}
