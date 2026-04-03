export const config = {
  listName: "Compare speed",
  displayText: "Speed {0} {1}",
  description: "Compare the character's current speed to a value.",
  params: [
    {
      id: "comparison",
      name: "Comparison",
      desc: "Comparison operator.",
      type: "combo",
      initialValue: "less",
      items: [
        { less: "<" },
        { less_eq: "≤" },
        { equal: "=" },
        { greater_eq: "≥" },
        { greater: ">" },
      ],
    },
    {
      id: "value",
      name: "Speed",
      desc: "Speed to compare against in px/s.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (comparison, value) {
  if (!this._phys) return false;
  const vx = this._phys.getVelocityX();
  const vy = this._phys.getVelocityY();
  const speed = Math.sqrt(vx * vx + vy * vy);
  const ops = ["less", "less_eq", "equal", "greater_eq", "greater"];
  const op = ops[comparison] || ops[0];
  switch (op) {
    case "less": return speed < value;
    case "less_eq": return speed <= value;
    case "equal": return speed === value;
    case "greater_eq": return speed >= value;
    case "greater": return speed > value;
    default: return false;
  }
}
