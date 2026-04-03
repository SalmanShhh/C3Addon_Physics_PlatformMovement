export const config = {
  listName: "Set wall slide",
  displayText: "Set wall slide to {0}",
  description: "Allow or prevent sliding down walls.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Check to allow wall sliding.",
      type: "boolean",
      initialValue: "false",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._wallSlide = enabled ? true : false;
}
