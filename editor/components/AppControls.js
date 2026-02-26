import { defineComponent }      from "vue";
import { usePreviewStore }       from "../stores/preview.js";

export default defineComponent({
  name: "AppControls",

  setup() {
    const store = usePreviewStore();
    return { store };
  },

  template: `
    <div class="controls">
      <label for="colorPicker">Background color</label>
      <input type="color" id="colorPicker" v-model="store.bgColor">
      <button :disabled="store.busy" @click="store.runPreview()">▶ Preview</button>
      <span class="status">{{ store.status }}</span>
    </div>
  `,
});
