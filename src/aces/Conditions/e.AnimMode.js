export const config = {
  returnType: "string",
  description: "Current animation mode string: \"Idle\", \"Moving\", \"Jumping\", \"Falling\", \"Wall sliding\", or \"Disabled\".",
  params: [],
};

export const expose = false;

export default function () {
  return this.animMode;
}
