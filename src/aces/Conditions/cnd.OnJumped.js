export const config = {
  isTrigger: true,
  listName: "On jumped",
  displayText: "On jumped",
  description: "Triggered every time the character jumps.",
  params: [],
};

export const expose = true;

export default function () {
  return true;
}
