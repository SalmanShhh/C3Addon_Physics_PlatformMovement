export const config = {
  listName: "Set ignore input",
  displayText: "Set ignore input to {0}",
  description: "When true, all input is ignored until re-enabled.",
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
  this._ignoreInput = ignore ? true : false;
}
