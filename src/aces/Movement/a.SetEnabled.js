export const config = {
  listName: "Set enabled",
  displayText: "Set enabled to {0}",
  description: "Fully enable or disable the behavior.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "True to enable.",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this.setEnabled(enabled);
}
