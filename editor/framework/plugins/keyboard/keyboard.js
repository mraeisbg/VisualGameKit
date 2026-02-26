// ── Keyboard plugin ───────────────────────────────────────────────────────

export default {
  id:          "keyboard",
  label:       "Keyboard",
  icon:        "./icon.png",
  description: "Polls keyboard state and fires named actions.",

  properties: [
    { name: "bindings", label: "Key bindings", type: "keymap", default: {
        up:    87,   // W
        down:  83,   // S
        left:  65,   // A
        right: 68,   // D
        fire:  32,   // Space
    }},
  ],

  agcFile: "./keyboard.agc",
};
