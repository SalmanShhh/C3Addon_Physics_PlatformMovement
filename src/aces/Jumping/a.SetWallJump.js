export const config = {
  listName: "Set wall jump",
  displayText: "Set wall jump to {0}",
  description: "Allow or prevent jumping off walls.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Check to allow wall jumping.",
      type: "boolean",
      initialValue: "false",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._wallJump = enabled ? true : false;
}
