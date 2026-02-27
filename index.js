// This script runs in the background Node context before any window opens.
// For app-level setup, global shortcuts, tray icons, etc.
import { config } from "../utils/config.js";

// Re-open the main window if all windows are closed (macOS behaviour)
nw.App.on("reopen", () => {
  const wins = nw.Window.getAll();
  if (wins.length === 0) {
    nw.Window.open("index.html", {
      title: config.title,
      width: config.width,
      height: config.height,
      position: config.position,
      frame: config.frame,
      show: config.show,
    });
  }
});
