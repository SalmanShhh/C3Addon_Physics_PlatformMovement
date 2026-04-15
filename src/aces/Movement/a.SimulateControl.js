export const config = {
  listName: "Simulate control",
  displayText: "Simulate {0}",
  description: "Tell the behavior to act as if the player pressed a movement key this tick. Use 'Left' and 'Right' every tick the button is held. Use 'Jump' on the frame the button is pressed and 'Jump release' on the frame it is released.",
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
