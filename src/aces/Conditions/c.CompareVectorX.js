export const config = {
  listName: "Compare vector X",
  displayText: "Vector X {0} {1}",
  description: "Compare the current X velocity component against a value.",
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
      name: "Vector X",
      desc: "Value to compare against.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (comparison, value) {
  if (!this._phys) return false;
  const vx = this._phys.getVelocityX();
  const ops = ["less", "less_eq", "equal", "greater_eq", "greater"];
  const op = ops[comparison] || ops[0];
  switch (op) {
    case "less": return vx < value;
    case "less_eq": return vx <= value;
    case "equal": return vx === value;
    case "greater_eq": return vx >= value;
    case "greater": return vx > value;
    default: return false;
  }
}
