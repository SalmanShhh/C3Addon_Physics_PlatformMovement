export const config = {
  isTrigger: true,
  listName: "On wall jumped",
  displayText: "On wall jumped",
  description: "Triggered when the character jumps off a wall.",
  params: [],
};

export const expose = true;

export default function () {
  return true;
}
