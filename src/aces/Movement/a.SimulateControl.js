export const config = {
  listName: "Simulate control",
  displayText: "Simulate {0}",
  description: "Simulate pressing or releasing a movement control this tick.",
  params: [
    {
      id: "control",
      name: "Control",
      desc: "Control to simulate.",
      type: "combo",
      initialValue: "left",
      items: [
        { left: "Left" },
        { right: "Right" },
        { jump: "Jump" },
        { jump_release: "Jump release" },
        { stop: "Stop" },
      ],
    },
  ],
};

export const expose = true;

export default function (control) {
  if (this._ignoreInput) return;
  const keys = ["left", "right", "jump", "jump_release", "stop"];
  const key = keys[control] || keys[0];
  switch (key) {
    case "left":
      this._inputX -= 1;
      break;
    case "right":
      this._inputX += 1;
      break;
    case "jump":
      this._jumpInputPressed = true;
      break;
    case "jump_release":
      this._jumpInputReleased = true;
      break;
    case "stop":
      this._stopInputThisTick = true;
      break;
  }
}
