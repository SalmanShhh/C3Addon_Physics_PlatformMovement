export const config = {
  listName: "Compare vector Y",
  displayText: "Vector Y {0} {1}",
  description: "Compare the vertical speed to a value. Positive = falling.",
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
      name: "Vector Y",
      desc: "Value to compare against.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (comparison, value) {
  if (!this._phys) return false;
  const vy = this._phys.getVelocityY();
  const ops = ["less", "less_eq", "equal", "greater_eq", "greater"];
  const op = ops[comparison] || ops[0];
  switch (op) {
    case "less": return vy < value;
    case "less_eq": return vy <= value;
    case "equal": return vy === value;
    case "greater_eq": return vy >= value;
    case "greater": return vy > value;
    default: return false;
  }
}
