export const config = {
  listName: "Simulate control",
  displayText: "Simulate {0}",
  description: "Simulate one of the movement controls being held down.",
  params: [
    {
      id: "control",
      name: "Control",
      desc: "Which control to simulate. Left/Right: hold every tick while moving. Jump: press on the frame the jump button is pressed. (if 'Variable Jumping) Jump release: press on the frame the jump button is released. Stop: instantly zero velocity.",
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
  this.simulateControl(control);
}
