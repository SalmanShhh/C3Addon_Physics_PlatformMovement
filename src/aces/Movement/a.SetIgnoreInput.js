export const config = {
  listName: "Set ignore input",
  displayText: "Set ignore input to {0}",
  description: "Block all movement input until turned off.",
  params: [
    {
      id: "ignore",
      name: "Ignore",
      desc: "Check to ignore all input.",
      type: "boolean",
      initialValue: "false",
    },
  ],
};

export const expose = true;

export default function (ignore) {
  this._ignoreInput = ignore ? true : false;
}
