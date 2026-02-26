// ── General-purpose utility functions ─────────────────────────────────────

/**
 * Convert a hex colour string to an { r, g, b } object (0-255 each).
 * @param {string} hex  e.g. "#1a2b3c" or "1a2b3c"
 */
export function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

/**
 * Zero-pad a number to a given width string.
 * @param {number} n
 * @param {number} [width=2]
 */
export function pad(n, width = 2) {
  return String(n).padStart(width, "0");
}

/**
 * Return a timestamp string suitable for log prefixes: "HH:MM:SS".
 */
export function timestamp() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Deep-clone a plain JSON-serialisable value.
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 */
export function capitalize(str) {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
}
