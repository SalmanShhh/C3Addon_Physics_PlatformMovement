export const config = {
  listName: "Set wall slide",
  displayText: "Set wall slide to {0}",
  description: "Toggle the ability to slide down walls.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Enable wall sliding.",
      type: "boolean",
      initialValue: "false",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._wallSlide = enabled ? true : false;
}
