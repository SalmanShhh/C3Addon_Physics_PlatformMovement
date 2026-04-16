export const config = {
  listName: "Set debug mode",
  displayText: "Set debug mode to {0}",
  description: "Turn debug console output on or off. Prints movement state to the browser console (F12) — handy when tuning values.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Whether debug mode is active.",
      type: "boolean",
      initialValue: "false",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this.setDebugMode(enabled);
}
