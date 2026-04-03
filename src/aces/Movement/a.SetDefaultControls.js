export const config = {
  listName: "Set default controls",
  displayText: "Set default controls to {0}",
  description: "Enable or disable automatic keyboard input reading.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Check to enable keyboard controls.",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._defaultControls = enabled ? true : false;
}
