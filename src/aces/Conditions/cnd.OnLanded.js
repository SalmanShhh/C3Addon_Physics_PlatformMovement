export const config = {
  isTrigger: true,
  listName: "On landed",
  displayText: "On landed",
  description: "Triggered when the character touches the ground after being in the air.",
  params: [],
};

export const expose = true;

export default function () {
  return true;
}
