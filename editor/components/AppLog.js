import { defineComponent, ref, watch, nextTick } from "vue";
import { usePreviewStore }                        from "../stores/preview.js";

export default defineComponent({
  name: "AppLog",

  setup() {
    const store  = usePreviewStore();
    const logRef = ref(null);

    // Auto-scroll to bottom whenever entries are added
    watch(
      () => store.logEntries.length,
      async () => {
        await nextTick();
        if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight;
      }
    );

    return { store, logRef };
  },

  template: `
    <div class="log" ref="logRef">
      <span
        v-for="entry in store.logEntries"
        :key="entry.id"
        :class="entry.cls"
      >{{ entry.text }}</span>
    </div>
  `,
});
