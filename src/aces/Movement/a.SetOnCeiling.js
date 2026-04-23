export const config = {
  listName: "Set on ceiling",
  displayText: "Set on ceiling to {0}",
  description: "Force the character to be treated as touching a ceiling this tick. Use with moving platforms or ceiling colliders where Physics contact alone is unreliable.",
  params: [
    {
      id: "onCeiling",
      name: "On ceiling",
      desc: "True to force the character to be considered touching a ceiling.",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (onCeiling) {
  this.setOnCeiling(onCeiling);
}
