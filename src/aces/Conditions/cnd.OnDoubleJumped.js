export const config = {
  isTrigger: true,
  listName: "On double jumped",
  displayText: "On double jumped",
  description: "Triggered when the character uses an extra mid-air jump.",
  params: [],
};

export const expose = true;

export default function () {
  return true;
}
