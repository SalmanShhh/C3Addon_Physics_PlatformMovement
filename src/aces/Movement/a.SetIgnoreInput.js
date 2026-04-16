export const config = {
  listName: "Set ignore input",
  displayText: "Set ignore input to {0}",
  description: "Block all character input without stopping physics.",
  params: [
    {
      id: "ignore",
      name: "Ignore",
      desc: "True to ignore all input.",
      type: "boolean",
      initialValue: "false",
    },
  ],
};

export const expose = true;

export default function (ignore) {
  this.setIgnoreInput(ignore);
}
