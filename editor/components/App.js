import { defineComponent }   from "vue";
import { usePreviewStore }   from "../stores/preview.js";
import { AGC_FILE, BUILD_DIR, OUTPUT_DIR, SHELL } from "../utils/paths.js";
import AppControls           from "./AppControls.js";
import AppLog                from "./AppLog.js";

export default defineComponent({
  name: "App",

  components: { AppControls, AppLog },

  setup() {
    const store = usePreviewStore();

    // Print startup paths so user can verify they're correct
    store.addLog(
      `Paths:\n  AGC:    ${AGC_FILE}\n  Build:  ${BUILD_DIR}\n  Output: ${OUTPUT_DIR}\n  Shell:  ${SHELL}\n`,
      "log-info"
    );

    return { store };
  },

  template: `
    <h1>TinyAGK Preview</h1>
    <app-controls />
    <app-log />
  `,
});
