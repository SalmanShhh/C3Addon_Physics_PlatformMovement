export const config = {
  listName: "On left wall contact",
  displayText: "On left wall contact",
  description: "Fires when the character leaves a wall without landing. The wall coyote window opens here — use to start a wall-coyote timer indicator.",
  isTrigger: true,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}
