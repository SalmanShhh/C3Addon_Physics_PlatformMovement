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
  this.simulateControl(control);
}
