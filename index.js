// TinyAGK — NW.js background entry point
// This script runs in the background Node context before any window opens.
// Use it for app-level setup, global shortcuts, tray icons, etc.

// Re-open the main window if all windows are closed (macOS behaviour)
nw.App.on("reopen", () => {
  const wins = nw.Window.getAll();
  if (wins.length === 0) {
    nw.Window.open("index.html", {
      title:    "TinyAGK",
      width:    960,
      height:   680,
      position: "center",
      frame:    true,
      show:     true,
    });
  }
});
