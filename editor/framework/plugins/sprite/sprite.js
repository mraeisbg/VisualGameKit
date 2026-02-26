// ── Sprite plugin ─────────────────────────────────────────────────────────
// Descriptor used by the editor to register this plugin.

export default {
  id:          "sprite",
  label:       "Sprite",
  icon:        "./icon.png",
  description: "Renders a 2-D image at a given world position.",

  properties: [
    { name: "image",  label: "Image file", type: "file",    default: "" },
    { name: "x",      label: "X",          type: "number",  default: 0 },
    { name: "y",      label: "Y",          type: "number",  default: 0 },
    { name: "scaleX", label: "Scale X",    type: "number",  default: 1 },
    { name: "scaleY", label: "Scale Y",    type: "number",  default: 1 },
    { name: "angle",  label: "Angle",      type: "number",  default: 0 },
    { name: "depth",  label: "Depth",      type: "number",  default: 0 },
  ],

  agcFile: "./sprite.agc",
};
