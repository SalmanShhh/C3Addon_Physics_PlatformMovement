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
  this._enabled = enabled ? true : false;
  if (!this._enabled) {
    this._onFloor = false;
    this._onCeiling = false;
    this._onWallLeft = false;
    this._onWallRight = false;
    this._wasOnFloor = false;
    this._isWallSliding = false;
    this._jumpsRemaining = this._maxJumps;
    this._coyoteTimer = 0;
    this._jumpBufferTimer = 0;
    this._airTime = 0;
    this._inputX = 0;
    this._jumpInputPressed = false;
    this._jumpInputReleased = false;
    this._stopInputThisTick = false;
  }
}
