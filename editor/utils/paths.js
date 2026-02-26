// ── Shared path constants ─────────────────────────────────────────────────
// `require` and `nw` are NW.js globals, available in ES-module scripts too.
const path = require("path");

export const APP_DIR    = nw.App.startPath;
export const AGC_FILE   = path.join(APP_DIR, "examples", "game1", "main.agc");
export const BUILD_DIR  = path.join(APP_DIR, "tools", "html5");
export const OUTPUT_DIR = path.join(APP_DIR, "output", "html5");
export const SHELL      = process.env.SHELL || "/bin/zsh";
