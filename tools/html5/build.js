#!/usr/bin/env node
"use strict";

/**
 * build.js — AGK compile + HTML5 export (Node.js port of run_agk.sh + build_html5.py)
 * Usage:
 *   node build.js [--project <dir>] [--config <path>] [--skip-compile] [--skip-html5]
 */

const fs   = require("fs");
const path = require("path");
const os   = require("os");
const { spawnSync } = require("child_process");

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const skipCompile = args.includes("--skip-compile");
const skipHtml5   = args.includes("--skip-html5");
const projectDir  = path.resolve(getArg("--project", process.cwd()));
const configPath  = path.resolve(getArg("--config", path.join(__dirname, "config.json")));

// ─── Load config ─────────────────────────────────────────────────────────────
if (!fs.existsSync(configPath)) {
  console.error(`ERROR: config not found: ${configPath}`);
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

function resolveValue(val) {
  if (typeof val !== "string") return val;
  return val
    .replace(/\$HOME/g, os.homedir())
    .replace(/^~/, os.homedir());
}

const WINE_PREFIX      = resolveValue(config.WINEPREFIX || "$HOME/.wine-construct2");
const AGK_COMPILER     = resolveValue(config.AGK_COMPILER);
const COMPILE_MODE     = config.COMPILE_MODE || "bytecode";
const USE_WINE         = config.USE_WINE !== false;
const TEMPLATE_BASE    = resolveValue(config.AGK_STUDIO_HTML5_DIR);
const HTML5_MODE       = config.MODE || "3D";
const HTML5_OUTPUT_DIR = path.resolve(projectDir, resolveValue(config.AGK_STUDIO_HTML5_OUTPUT_DIR));

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Compile
// ─────────────────────────────────────────────────────────────────────────────
function compile() {
  console.log(`\n=== Step 1: Compile (mode: ${COMPILE_MODE}) ===`);
  console.log(`Project: ${projectDir}`);

  const mainFile = "main.agc";
  if (!fs.existsSync(path.join(projectDir, mainFile))) {
    console.error(`ERROR: ${mainFile} not found in project directory.`);
    process.exit(1);
  }

  let cmd, cmdArgs;
  if (USE_WINE) {
    cmd     = "wine";
    cmdArgs = [AGK_COMPILER, `-${COMPILE_MODE}`, mainFile];
  } else {
    cmd     = AGK_COMPILER;
    cmdArgs = [`-${COMPILE_MODE}`, mainFile];
  }

  const env = { ...process.env };
  if (USE_WINE) env.WINEPREFIX = WINE_PREFIX;

  console.log(`Running: ${cmd} ${cmdArgs.join(" ")}`);

  const result = spawnSync(cmd, cmdArgs, {
    cwd: projectDir,
    env,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`ERROR launching compiler: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`ERROR: Compiler exited with code ${result.status}`);
    process.exit(result.status);
  }

  console.log("Compilation successful.");
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — HTML5 export
// ─────────────────────────────────────────────────────────────────────────────
function buildHtml5() {
  console.log(`\n=== Step 2: HTML5 export (mode: ${HTML5_MODE}) ===`);

  const mediaDir  = path.join(projectDir, "media");
  const outputDir = HTML5_OUTPUT_DIR;
  const tmpDir    = path.join(outputDir, "_build_tmp");
  const modeDir   = path.join(TEMPLATE_BASE, HTML5_MODE);

  // Validate
  if (!fs.existsSync(mediaDir)) {
    console.error(`ERROR: media folder not found: ${mediaDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(TEMPLATE_BASE)) {
    console.error(`ERROR: AGK template dir not found: ${TEMPLATE_BASE}`);
    process.exit(1);
  }
  if (!fs.existsSync(modeDir)) {
    const available = fs.readdirSync(TEMPLATE_BASE).join(", ");
    console.error(`ERROR: mode folder not found: ${modeDir}`);
    console.error(`Available modes: ${available}`);
    process.exit(1);
  }

  console.log(`Using template: ${modeDir}`);

  // 1. Copy template → tmp
  if (fs.existsSync(tmpDir)) rmrf(tmpDir);
  copyDirSync(modeDir, tmpDir);
  console.log(`Copied template to: ${tmpDir}`);

  // 2. Walk media files
  const allFiles = walkDir(mediaDir);
  if (allFiles.length === 0) {
    console.error("ERROR: No files found in media/ folder!");
    process.exit(1);
  }
  console.log(`Packing ${allFiles.length} file(s) into AGKPlayer.data...`);

  // 3. Pack into AGKPlayer.data
  const dataFilePath     = path.join(tmpDir, "AGKPlayer.data");
  const filesManifest    = [];
  const additionalFolders = new Set();
  let currentPos = 0;

  const dataChunks = [];
  for (const fullPath of allFiles) {
    let rel = path.relative(path.dirname(mediaDir), fullPath).replace(/\\/g, "/");
    if (!rel.startsWith("/")) rel = "/" + rel;

    // Collect intermediate parent folders
    const parts = rel.replace(/^\//, "").split("/");
    for (let i = 1; i < parts.length; i++) {
      additionalFolders.add("/" + parts.slice(0, i).join("/"));
    }

    const fileData = fs.readFileSync(fullPath);
    const fileSize = fileData.length;
    dataChunks.push(fileData);

    filesManifest.push({
      filename: rel,
      start: currentPos,
      end: currentPos + fileSize,
      audio: false,
    });

    console.log(`  + ${rel}  (${fileSize} bytes @ offset ${currentPos})`);
    currentPos += fileSize;
  }

  fs.writeFileSync(dataFilePath, Buffer.concat(dataChunks));
  console.log(`AGKPlayer.data written: ${currentPos} total bytes`);

  // 4. Build %%ADDITIONALFOLDERS%% replacement
  let foldersStr = 'Module["FS_createPath"]("/", "media", true, true);';
  for (const folder of [...additionalFolders].sort()) {
    const parts = folder.replace(/^\//, "").split("/");
    if (parts.length >= 2) {
      const parent = "/" + parts.slice(0, -1).join("/");
      const child  = parts[parts.length - 1];
      foldersStr += `Module["FS_createPath"]("${parent}", "${child}", true, true);`;
    }
  }

  // 5. Build %%LOADPACKAGE%% replacement
  const filesJson      = JSON.stringify(filesManifest);
  const loadPackageStr =
    `loadPackage({"files":${filesJson},` +
    `"remote_package_size":${currentPos},` +
    `"package_uuid":"e3c8dd30-b68a-4332-8c93-d0cf8f9d28a0"})`;

  // 6. Patch AGKPlayer.js
  const agkPlayerJs = path.join(tmpDir, "AGKPlayer.js");
  if (!fs.existsSync(agkPlayerJs)) {
    console.error(`ERROR: AGKPlayer.js not found in template: ${agkPlayerJs}`);
    process.exit(1);
  }

  let jsContent = fs.readFileSync(agkPlayerJs, "utf8");

  if (!jsContent.includes("%%ADDITIONALFOLDERS%%")) {
    console.error("ERROR: %%ADDITIONALFOLDERS%% placeholder not found in AGKPlayer.js");
    process.exit(1);
  }
  if (!jsContent.includes("%%LOADPACKAGE%%")) {
    console.error("ERROR: %%LOADPACKAGE%% placeholder not found in AGKPlayer.js");
    process.exit(1);
  }

  const ts = Math.floor(Date.now() / 1000);
  jsContent = jsContent.replace("%%ADDITIONALFOLDERS%%", foldersStr);
  jsContent = jsContent.replace("%%LOADPACKAGE%%", loadPackageStr);
  // Bust all asset references inside AGKPlayer.js
  jsContent = jsContent.replace(/"AGKPlayer\.data"/g,     `"AGKPlayer.data?v=${ts}"`);
  jsContent = jsContent.replace(/"AGKPlayer\.asm\.js"/g,  `"AGKPlayer.asm.js?v=${ts}"`);
  jsContent = jsContent.replace(/"AGKPlayer\.html\.mem"/g,`"AGKPlayer.html.mem?v=${ts}"`);

  fs.writeFileSync(agkPlayerJs, jsContent, "utf8");
  console.log("AGKPlayer.js patched.");

  // 6b. Patch AGKPlayer.html — bust the <script src="AGKPlayer.js"> reference
  const agkPlayerHtml = path.join(tmpDir, "AGKPlayer.html");
  if (fs.existsSync(agkPlayerHtml)) {
    let htmlContent = fs.readFileSync(agkPlayerHtml, "utf8");
    htmlContent = htmlContent.replace(
      /(<script[^>]+src=["'])AGKPlayer\.js(["'])/gi,
      `$1AGKPlayer.js?v=${ts}$2`
    );
    fs.writeFileSync(agkPlayerHtml, htmlContent, "utf8");
    console.log("AGKPlayer.html patched.");
  }

  // 7. Copy to final output
  fs.mkdirSync(outputDir, { recursive: true });

  const copyFiles = [
    "AGKPlayer.js",
    "AGKPlayer.asm.js",
    "AGKPlayer.data",
    "AGKPlayer.html.mem",
    "AGKPlayer.html",
    "dots.png",
    "agks-logo-white.svg",
  ];

  for (const fname of copyFiles) {
    const src = path.join(tmpDir, fname);
    const dst = path.join(outputDir, fname);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      console.log(`  Copied: ${fname}`);
    } else {
      console.log(`  (skipped, not found): ${fname}`);
    }
  }

  // 8. Cleanup
  rmrf(tmpDir);

  console.log(`\nDone! Files are in: ${outputDir}`);
  console.log(`Serve with:  cd "${outputDir}" && python3 -m http.server 8080`);
  console.log(`Then open:   http://localhost:8080/AGKPlayer.html`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Recursively walk a directory and return sorted file paths. */
function walkDir(dir) {
  const results = [];
  function walk(current) {
    const entries = fs.readdirSync(current).sort();
    for (const entry of entries) {
      const full = path.join(current, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else results.push(full);
    }
  }
  walk(dir);
  return results;
}

/** Copy directory recursively. */
function copyDirSync(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const dstPath = path.join(dst, entry);
    if (fs.statSync(srcPath).isDirectory()) copyDirSync(srcPath, dstPath);
    else fs.copyFileSync(srcPath, dstPath);
  }
}

/** Remove a directory and all its contents. */
function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) rmrf(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(dir);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Move media + .exe to output
// ─────────────────────────────────────────────────────────────────────────────
function moveAssets() {
  console.log("\n=== Step 3: Move assets to output ===");

  const compileOutputDir = path.resolve(projectDir, resolveValue(config.AGK_COMPILE_OUTPUT || "./output"));
  fs.mkdirSync(compileOutputDir, { recursive: true });

  // Move media/ → output/media/
  const mediaSrc = path.join(projectDir, "media");
  const mediaDst = path.join(compileOutputDir, "media");
  if (fs.existsSync(mediaSrc)) {
    if (fs.existsSync(mediaDst)) rmrf(mediaDst);
    fs.renameSync(mediaSrc, mediaDst);
    console.log(`  Moved: media/ → ${path.relative(projectDir, mediaDst)}/`);
  } else {
    console.log("  (skipped) media/ not found in project dir.");
  }

  // Find .exe in project dir and move as main.exe
  const exeFiles = fs.readdirSync(projectDir).filter(f => f.toLowerCase().endsWith(".exe"));
  if (exeFiles.length > 0) {
    const exeSrc = path.join(projectDir, exeFiles[0]);
    const exeDst = path.join(compileOutputDir, "main.exe");
    fs.renameSync(exeSrc, exeDst);
    console.log(`  Moved: ${exeFiles[0]} → ${path.relative(projectDir, exeDst)}`);
    if (exeFiles.length > 1) {
      console.log(`  (note) ${exeFiles.length - 1} other .exe file(s) ignored.`);
    }
  } else {
    console.log("  (skipped) No .exe found in project dir.");
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
console.log(`Project dir : ${projectDir}`);
console.log(`Config      : ${configPath}`);

if (!skipCompile) compile();
else console.log("\n=== Step 1: Compile (skipped) ===");

if (!skipHtml5) buildHtml5();
else console.log("=== Step 2: HTML5 export (skipped) ===");

moveAssets();
