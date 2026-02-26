// ── Blink behaviour ───────────────────────────────────────────────────────
// Descriptor used by the editor to register and configure this behaviour.

export default {
  id:          "blink",
  label:       "Blink",
  icon:        "./icon.png",
  description: "Toggles the visibility of a sprite at a given interval.",

  // Properties exposed in the editor UI
  properties: [
    { name: "interval", label: "Interval (ms)", type: "number", default: 500 },
    { name: "enabled",  label: "Enabled",       type: "boolean", default: true },
  ],

  // AGC source file bundled with this behaviour
  agcFile: "./blink.agc",
};
