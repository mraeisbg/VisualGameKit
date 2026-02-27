import { defineComponent } from "vue";
import { usePreviewStore } from "../stores/preview.js";
import { AGC_FILE, BUILD_DIR, OUTPUT_DIR, SHELL } from "../utils/paths.js";
import AppLog from "./AppLog.js";

export default defineComponent({
  name: "App",

  components: { AppLog },

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
    <header class="ribbon">
      <div class="ribbon-logo">
        <span class="ribbon-logo-text">Code Architect</span>
      </div>
      <div class="ribbon-group">
        <button id="cutBtn" class="ribbon-btn" title="Cut (Ctrl+X)">
          <svg class="ribbon-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="4.5" cy="12.5" r="2"/><circle cx="11.5" cy="12.5" r="2"/>
            <line x1="4.5" y1="10.5" x2="8" y2="5"/><line x1="11.5" y1="10.5" x2="8" y2="5"/>
          </svg>
          <span>Cut</span>
        </button>
        <button id="copyBtn" class="ribbon-btn" title="Copy (Ctrl+C)">
          <svg class="ribbon-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="5.5" y="5.5" width="7" height="8" rx="1"/>
            <path d="M3.5 10.5V3.5a1 1 0 011-1h7"/>
          </svg>
          <span>Copy</span>
        </button>
        <button id="pasteBtn" class="ribbon-btn" title="Paste (Ctrl+V)">
          <svg class="ribbon-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2.5" y="5" width="8" height="9" rx="1"/>
            <path d="M5.5 5V3.5A1 1 0 016.5 2.5h3A1 1 0 0110.5 3.5V5"/>
          </svg>
          <span>Paste</span>
        </button>
      </div>
      <div class="ribbon-divider"></div>
      <div class="ribbon-group">
        <button id="addObjectRibbonBtn" class="ribbon-btn ribbon-primary" title="Insert a new object">
          <svg class="ribbon-icon" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2.25" y="7.25" width="11.5" height="1.5" rx="0.75"/>
            <rect x="7.25" y="2.25" width="1.5" height="11.5" rx="0.75"/>
          </svg>
          <span>Add Object</span>
        </button>
        <button id="addSceneBtn" class="ribbon-btn" title="Add a new layout">
          <svg class="ribbon-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="2" width="12" height="12" rx="1.5"/>
            <line x1="8" y1="5" x2="8" y2="11"/><line x1="5" y1="8" x2="11" y2="8"/>
          </svg>
          <span>Layout</span>
        </button>
      </div>
    </header>

    <!-- SHELL -->
    <div class="c2-shell">

      <!-- LEFT PANEL -->
      <aside class="c2-left">
        <div class="left-tabs">
          <button class="left-tab active" data-left-tab="layout">Layout</button>
          <button class="left-tab" data-left-tab="project">Project</button>
          <button class="left-tab" data-left-tab="object">Object</button>
        </div>

        <!-- Tab: Layout Properties -->
        <section id="leftTabLayout" class="left-tab-body props-box">
          <div class="props-section-title">Layout properties</div>
          <div class="prop-row"><span class="prop-key">Name</span><span id="propLayoutName" class="prop-val">Layout 1</span></div>
          <div class="prop-row"><span class="prop-key">Event sheet</span><span id="propEventSheet" class="prop-val">Event sheet 1</span></div>
          <div class="prop-row"><span class="prop-key">Width</span><span id="propLayoutWidth" class="prop-val">800</span></div>
          <div class="prop-row"><span class="prop-key">Height</span><span id="propLayoutHeight" class="prop-val">600</span></div>
          <div class="prop-row">
            <span class="prop-key">Background</span>
            <input id="propLayoutColor" type="color" class="prop-input" value="#ffffff" style="height:20px;padding:0 2px;" />
          </div>
          <div class="prop-row"><span class="prop-key">Unbounded scroll</span><span class="prop-val">No</span></div>
          <div class="props-section-title" style="margin-top:8px">Active Layer</div>
          <div class="prop-row">
            <span class="prop-key">Layer</span>
            <select id="activeLayerSelect" class="prop-input" style="height:22px;padding:1px 4px"></select>
          </div>
          <div class="props-section-title" style="margin-top:8px">Effects</div>
          <div class="prop-row"><span class="prop-key">Add/edit</span><span class="prop-val prop-link">Effects</span></div>
          <p id="layoutSelectionInfo" class="c2-hint">No instance selected</p>
        </section>

        <!-- Tab: Project Properties -->
        <section id="leftTabProject" class="left-tab-body props-box" hidden>
          <div class="props-section-title">Project</div>
          <div class="prop-row"><span class="prop-key">Name</span><span class="prop-val">My Project</span></div>
          <div class="prop-row"><span class="prop-key">Format</span><span class="prop-val">code-architect.v1</span></div>
          <div class="props-section-title" style="margin-top:8px">Interchange</div>
          <div class="btn-stack">
            <button id="exportJsonBtn" class="c2-btn">Export JSON</button>
          </div>
          <label class="field-label" for="interchangeOutput">Output</label>
          <textarea id="interchangeOutput" rows="5" placeholder="Exported JSON/XML appears here"></textarea>
          <label class="field-label" style="margin-top:8px" for="importInput">Import JSON</label>
          <textarea id="importInput" rows="4" placeholder='Paste JSON with {"project": ... }'></textarea>
          <button id="importJsonBtn" class="c2-btn secondary" style="margin-top:6px">Import JSON</button>
        </section>

        <!-- Tab: Object Properties -->
        <section id="leftTabObject" class="left-tab-body props-box" hidden>
          <div id="layoutControls">
            <div id="instancePropsPanel">
              <p class="c2-hint" style="padding:4px 0">No instance selected</p>
            </div>
          </div>
          <div id="eventControls" hidden>
            <div class="props-section-title">Event Actions</div>
            <p class="c2-hint">Select an event in the sheet, then add an action.</p>
            <button id="addActionBtn" class="c2-btn secondary">Add Action to Selected Event</button>
          </div>
        </section>

        <!-- Z Order -->
        <div id="zOrderPanel" class="z-order-box">
          <div class="panel-hdr">
            <span>Z Order</span>
            <span class="hdr-btns">
              <button id="moveZUpBtn" class="hdr-icon-btn" title="Move up">▲</button>
              <button id="moveZDownBtn" class="hdr-icon-btn" title="Move down">▼</button>
            </span>
          </div>
          <div id="zOrderList" class="scroll-list"></div>
        </div>
      </aside>

      <!-- CENTER PANEL -->
      <section class="c2-center">
        <div class="editor-tabbar" id="editorTabbar"></div>
        <div id="layoutEditor" class="editor-body">
          <div id="layoutWorkspace" class="layout-canvas">
          <div class="scene-bounds"></div>
          </div>
        </div>
        <div id="eventEditor" class="editor-body event-body" hidden>
          <div class="event-sheet-hdr">
            <span id="selectionInfo" class="c2-hint">No event selected</span>
            <button id="openAddEventDialogBtn" class="c2-btn">Add Event</button>
          </div>
          <div id="eventList" class="event-list"></div>
        </div>
      </section>

      <!-- RIGHT PANEL -->
      <aside class="c2-right">
        <div class="right-pane" id="rightPaneProject">
          <div class="panel-hdr"><span>Projects</span></div>
          <div class="project-tree-body">
            <div class="tree-folder-row"><span class="tree-arrow open">▼</span><span class="folder-ico">📁</span> Layouts</div>
            <div id="projectLayouts" class="tree-children"></div>
            <div class="tree-folder-row"><span class="tree-arrow open">▼</span><span class="folder-ico">📁</span> Event sheets</div>
            <div id="projectEventSheets" class="tree-children"></div>
            <div class="tree-folder-row"><span class="tree-arrow open">▼</span><span class="folder-ico">📁</span> Object types</div>
            <div id="projectObjectTypes" class="tree-children"></div>
            <div class="tree-folder-row"><span class="tree-arrow">▶</span><span class="folder-ico">📁</span> Families</div>
            <div class="tree-folder-row"><span class="tree-arrow">▶</span><span class="folder-ico">📁</span> Sounds</div>
            <div class="tree-folder-row"><span class="tree-arrow">▶</span><span class="folder-ico">📁</span> Music</div>
            <div class="tree-folder-row"><span class="tree-arrow open">▼</span><span class="folder-ico">📁</span> Files</div>
            <div id="projectFiles" class="tree-children"></div>
          </div>
        </div>
        <div class="right-pane" id="rightPaneLayers">
          <div class="panel-hdr">
            <span>Layers</span>
            <span class="hdr-btns">
              <button id="addLayerBtn" class="hdr-icon-btn" title="Add Layer">+</button>
            </span>
          </div>
          <div id="projectLayers" class="scroll-list layer-list"></div>
        </div>
        <div class="right-pane" id="rightPaneObjects">
          <div class="panel-hdr"><span>Objects in Scene</span></div>
          <div id="projectObjects" class="object-grid"></div>
        </div>

      </aside>
    </div>

    <template id="eventTemplate">
      <article class="event-card">
        <header class="event-header">
          <button class="select-event c2-btn secondary">▶ Select</button>
          <div class="event-summary"></div>
          <div class="event-actions">
            <button class="add-subevent hdr-icon-btn" title="Add sub-event">＋</button>
            <button class="move-up hdr-icon-btn" title="Move up">↑</button>
            <button class="move-down hdr-icon-btn" title="Move down">↓</button>
            <button class="delete-event hdr-icon-btn danger-icon" title="Delete event">✕</button>
          </div>
        </header>
        <ul class="action-list"></ul>
      </article>
    </template>

    <dialog id="addEventDialog" class="c2-dialog">
      <form method="dialog" class="dialog-shell">
        <header class="dialog-hdr">
          <h2>Add Event</h2>
          <button id="closeAddEventDialogBtn" class="hdr-icon-btn" value="cancel">✕</button>
        </header>
        <section id="eventDialogPickView" class="dialog-body">
          <div class="dialog-cols">
            <div>
              <h3 class="dialog-col-title">Categories</h3>
              <div id="eventCategoryList" class="dialog-list"></div>
            </div>
            <div>
              <h3 class="dialog-col-title">Events</h3>
              <div id="eventTypeList" class="dialog-list"></div>
            </div>
          </div>
        </section>
        <section id="eventDialogParamsView" class="dialog-body" hidden>
          <h3 id="eventParamTitle" class="dialog-col-title">Parameters</h3>
          <div id="eventParamFields" class="param-fields"></div>
          <div class="dialog-footer">
            <button id="backToEventPickBtn" type="button" class="c2-btn secondary">Back</button>
            <button id="confirmAddEventBtn" type="button" class="c2-btn">Create Event</button>
          </div>
        </section>
      </form>
    </dialog>

    <dialog id="addActionDialog" class="c2-dialog">
      <form method="dialog" class="dialog-shell">
        <header class="dialog-hdr">
          <h2>Add Action</h2>
          <button id="closeAddActionDialogBtn" class="hdr-icon-btn" value="cancel">✕</button>
        </header>
        <section id="actionDialogPickView" class="dialog-body">
          <div class="dialog-cols">
            <div>
              <h3 class="dialog-col-title">Categories</h3>
              <div id="actionCategoryList" class="dialog-list"></div>
            </div>
            <div>
              <h3 class="dialog-col-title">Actions</h3>
              <div id="actionTypeList" class="dialog-list"></div>
            </div>
          </div>
        </section>
        <section id="actionDialogParamsView" class="dialog-body" hidden>
          <h3 id="actionParamTitle" class="dialog-col-title">Parameters</h3>
          <div id="actionParamFields" class="param-fields"></div>
          <div class="dialog-footer">
            <button id="backToActionPickBtn" type="button" class="c2-btn secondary">Back</button>
            <button id="confirmAddActionBtn" type="button" class="c2-btn">Create Action</button>
          </div>
        </section>
      </form>
    </dialog>

    <dialog id="addObjectDialog" class="c2-dialog">
      <form method="dialog" class="dialog-shell">
        <header class="dialog-hdr">
          <h2>Insert New Object</h2>
          <button id="closeAddObjectDialogBtn" class="hdr-icon-btn" value="cancel">✕</button>
        </header>
        <section class="dialog-body">
          <h3 class="dialog-col-title">Choose object type</h3>
          <div id="objectTypePicker" class="object-type-grid">
            <button type="button" class="dialog-item object-type-item" data-object-type="sprite">
              <span class="otype-ico">🖼</span><span>Sprite</span>
            </button>
            <button type="button" class="dialog-item object-type-item" data-object-type="text">
              <span class="otype-ico" style="font-weight:700;font-size:1.1rem">T</span><span>Text</span>
            </button>
            <button type="button" class="dialog-item object-type-item" data-object-type="button">
              <span class="otype-ico">🔲</span><span>Button</span>
            </button>
            <button type="button" class="dialog-item object-type-item" data-object-type="tilemap">
              <span class="otype-ico">⬛</span><span>Tilemap</span>
            </button>
          </div>
          <input id="objectType" type="hidden" value="sprite" />
          <div style="margin-top:14px">
            <label class="field-label" for="objectName">Name (leave blank for auto)</label>
            <input id="objectName" type="text" placeholder="e.g. Player" />
          </div>
          <div class="field-row" style="margin-top:10px">
            <div>
              <label class="field-label" for="objectX">X</label>
              <input id="objectX" type="text" value="100" />
            </div>
            <div>
              <label class="field-label" for="objectY">Y</label>
              <input id="objectY" type="text" value="100" />
            </div>
          </div>
          <div class="dialog-footer">
            <button id="confirmAddObjectBtn" type="button" class="c2-btn">Insert</button>
          </div>
        </section>
      </form>
    </dialog>

  `,
});
