import { defineStore }                      from "pinia";
import { APP_DIR, AGC_FILE, BUILD_DIR, OUTPUT_DIR, SHELL } from "../utils/paths.js";
import { hexToRgb }                          from "../utils/helpers.js";

// ── Node globals (injected by NW.js) ──────────────────────────────────────
const fs    = require("fs");
const path  = require("path");
const http  = require("http");
const spawn = require("child_process").spawn;

// ── MIME map ──────────────────────────────────────────────────────────────
const MIME = {
  ".html": "text/html",
  ".js":   "application/javascript",
  ".mem":  "application/octet-stream",
  ".data": "application/octet-stream",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
};

// ── Server + preview window singletons (not reactive) ────────────────────
let server     = null;
let serverPort = 0;
let previewWin = null;

// ── Store ─────────────────────────────────────────────────────────────────
export const usePreviewStore = defineStore("preview", {
  state: () => ({
    bgColor:    "#080e14",
    status:     "Ready",
    busy:       false,
    logEntries: [],   // { id, text, cls }
  }),

  actions: {
    // ── Log helpers ───────────────────────────────────────────────────
    addLog(text, cls = "") {
      this.logEntries.push({ id: Date.now() + Math.random(), text, cls });
    },
    clearLog() {
      this.logEntries = [];
    },

    // ── Utilities ─────────────────────────────────────────────────────
    writeAgc(r, g, b) {
      let src = fs.readFileSync(AGC_FILE, "utf8");
      src = src.replace(
        /SetClearColor\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/,
        `SetClearColor(${r}, ${g}, ${b})`
      );
      fs.writeFileSync(AGC_FILE, src, "utf8");
    },

    // ── Build ─────────────────────────────────────────────────────────
    runBuild() {
      return new Promise((resolve, reject) => {
        const cmd = `node build.js --project "${path.join(APP_DIR, "examples", "game1")}" --config "${path.join(BUILD_DIR, "config.json")}"`;  
        this.addLog(`  shell: ${SHELL} -lc\n  cmd:   ${cmd}\n`);

        const proc = spawn(SHELL, ["-lc", cmd], {
          cwd:   BUILD_DIR,
          stdio: ["ignore", "pipe", "pipe"],
        });

        proc.stdout.on("data", d => this.addLog(d.toString()));
        proc.stderr.on("data", d => this.addLog(d.toString(), "log-err"));
        proc.on("error", err => reject(new Error(`Failed to launch shell: ${err.message}`)));
        proc.on("close", code => {
          if (code === 0) resolve();
          else reject(new Error(`Build exited with code ${code}`));
        });
      });
    },

    // ── HTTP server ───────────────────────────────────────────────────
    ensureServer() {
      return new Promise((resolve, reject) => {
        if (server) { resolve(serverPort); return; }

        server = http.createServer((req, res) => {
          let urlPath = req.url.split("?")[0];
          if (!urlPath || urlPath === "/") urlPath = "/AGKPlayer.html";

          const filePath = path.join(OUTPUT_DIR, urlPath);
          const ext      = path.extname(filePath).toLowerCase();

          try {
            const data = fs.readFileSync(filePath);
            res.writeHead(200, {
              "Content-Type":  MIME[ext] || "application/octet-stream",
              "Cache-Control": "no-store",
            });
            res.end(data);
          } catch (e) {
            res.writeHead(404);
            res.end("Not found: " + urlPath);
          }
        });

        server.listen(0, "127.0.0.1", () => {
          serverPort = server.address().port;
          resolve(serverPort);
        });
        server.on("error", reject);
      });
    },

    // ── Preview window ────────────────────────────────────────────────
    openOrReloadPreview(port) {
      const url = `http://127.0.0.1:${port}/AGKPlayer.html`;
      this.addLog(`\n► Preview: ${url}\n`, "log-info");

      if (previewWin) {
        try {
          previewWin.reload(true);
          previewWin.show();
          previewWin.focus();
          return;
        } catch (e) {
          previewWin = null; // was closed by user
        }
      }

      nw.Window.open(url, {
        title:    "TinyAGK Preview",
        width:    1280,
        height:   720,
        position: "center",
        frame:    true,
        show:     true,
      }, (win) => {
        previewWin = win;
        win.on("closed", () => { previewWin = null; });
      });
    },

    // ── Main pipeline ─────────────────────────────────────────────────
    async runPreview() {
      if (this.busy) return;
      this.busy = true;
      this.clearLog();

      const { r, g, b } = hexToRgb(this.bgColor);

      try {
        this.status = "Writing main.agc…";
        this.addLog(`► Writing SetClearColor(${r}, ${g}, ${b}) to main.agc\n`, "log-info");
        this.writeAgc(r, g, b);

        this.status = "Compiling…";
        this.addLog("► Running build…\n", "log-info");
        await this.runBuild();

        this.status = "Starting preview server…";
        this.addLog("\n► Starting HTTP server…\n", "log-info");
        const port = await this.ensureServer();
        this.addLog(`  Serving ${OUTPUT_DIR}\n  on http://127.0.0.1:${port}/\n`, "log-ok");

        this.status = "Opening preview…";
        this.openOrReloadPreview(port);
        this.status = "Done ✔";
        this.addLog("► Preview window refreshed.\n", "log-ok");

      } catch (err) {
        this.addLog(`\n✖ ${err.message}\n`, "log-err");
        this.status = "Error — see log";
      } finally {
        this.busy = false;
      }
    },
  },
});
