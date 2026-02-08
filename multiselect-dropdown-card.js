import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";


// Unterstützt mode: 'boolean' (default) oder 'text'.
// Im Text-Modus wird die Auswahl als kommaseparierte Werte (item.value) in text_entity gespeichert.
class MultiSelectDropdown extends LitElement {
  _overlayElement = null;

  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _open: { state: true },
    _direction: { state: true }, // up | down
    _pendingStates: { state: true }, // Temporäre States während Dropdown offen
  };


  constructor() {
    super();
    this._open = false;
    this._direction = "down";
    this._pendingStates = {}; // { entity_id: boolean } oder { value: boolean } im Text-Modus
    this._outsideHandler = this._handleOutside.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._outsideHandler);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._outsideHandler);
    super.disconnectedCallback();
  }

  // Wird aufgerufen wenn hass sich ändert
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('hass') && this.hass) {
      // Force re-render wenn sich hass states ändern
      this.requestUpdate();
    }
  }


  setConfig(config) {
    if (!Array.isArray(config.items)) {
      throw new Error("items missing");
    }
    this.config = {
      item_summarize: false,
      mode: "boolean", // default
      ...config,
    };
    if (this.config.mode === "text" && !this.config.text_entity) {
      throw new Error("text_entity required in text mode");
    }
  }

  static getConfigElement() {
    return document.createElement("multiselect-dropdown-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:multiselect-dropdown",
      name: "Wochentage",
      icon: "mdi:calendar-expand-horizontal-outline",
      icon_color: "#44739e",
      item_summarize: true,
      items: [
        { name: "Montag", short: "Mo", entity: "input_boolean.irrigation_monday" },
        { name: "Dienstag", short: "Di", entity: "input_boolean.irrigation_tuesday" },
        { name: "Mittwoch", short: "Mi", entity: "input_boolean.irrigation_wednesday" },
        { name: "Donnerstag", short: "Do", entity: "input_boolean.irrigation_thursday" },
        { name: "Freitag", short: "Fr", entity: "input_boolean.irrigation_friday" },
        { name: "Samstag", short: "Sa", entity: "input_boolean.irrigation_saturday" },
        { name: "Sonntag", short: "So", entity: "input_boolean.irrigation_sunday" },
      ],
    };
  }

  /* ===== Outside click ===== */
  _handleOutside(e) {
    if (this._open && !this.shadowRoot.contains(e.target)) {
      this._commitChanges();
      this._open = false;
    }
  }

  /* ===== Toggle dropdown ===== */

  _toggleMenu(e) {
    e.stopPropagation();

    if (!this._open) {
      // Beim Öffnen: Aktuelle States in pending kopieren
      this._pendingStates = {};
      if (this.config.mode === "text") {
        // Text-Modus: Werte aus text_entity splitten oder JSON-Array parsen
        const textVal = this.hass.states[this.config.text_entity]?.state || "";
        let selected = [];
        try {
          if (textVal.trim().startsWith("[") && textVal.trim().endsWith("]")) {
            // JSON-Array
            selected = JSON.parse(textVal);
            if (!Array.isArray(selected)) selected = [];
            selected = selected.map(String); // alles zu String für Vergleich
          } else {
            selected = textVal.split(",").map(s => s.trim()).filter(Boolean);
          }
        } catch (e) {
          selected = [];
        }
        this.config.items.forEach(item => {
          this._pendingStates[item.value] = selected.includes(String(item.value));
        });
      } else {
        // Boolean-Modus wie bisher
        this.config.items.forEach(item => {
          this._pendingStates[item.entity] = this.hass.states[item.entity]?.state === "on";
        });
      }

      // Overlay-Menü im <body> erzeugen
      const anchor = this.shadowRoot.getElementById("anchor");
      if (!anchor) {
        console.warn("Anchor-Element für Dropdown nicht gefunden.");
        return;
      }
      const rect = anchor.getBoundingClientRect();
      if (!rect || rect.width === 0) {
        console.warn("BoundingRect für Dropdown nicht gefunden oder Breite 0.");
        return;
      }
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      this._direction = spaceBelow < 250 && spaceAbove > spaceBelow ? "up" : "down";
      this._overlayMaxHeight = this._direction === "down"
        ? Math.max(spaceBelow - 16, 100)
        : Math.max(spaceAbove - 16, 100);

      // Overlay-DIV erzeugen
      this._overlayElement = document.createElement("div");
      this._overlayElement.className = `multiselect-dropdown-overlay ${this._direction}`;
      // Positionierung relativ zum Viewport, inkl. Scroll-Offset
      this._overlayElement.style.position = "absolute";
      this._overlayElement.style.left = `${rect.left + window.scrollX}px`;
      if (this._direction === "down") {
        // Direkt unter dem Button
        this._overlayElement.style.top = `${rect.bottom + window.scrollY}px`;
      } else {
        // Erst temporär positionieren, dann nach Höhe ausrichten
        this._overlayElement.style.top = `${rect.top + window.scrollY}px`;
      }
      this._overlayElement.style.width = `${rect.width}px`;
      this._overlayElement.style.maxHeight = `${this._overlayMaxHeight}px`;
      this._overlayElement.style.zIndex = "9999";
      this._overlayElement.style.background = "var(--card-background-color, #fff)";
      this._overlayElement.style.borderRadius = "0 0 4px 4px";
      this._overlayElement.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
      this._overlayElement.style.overflowY = "auto";
      this._overlayElement.style.padding = "6px 0";
      this._overlayElement.style.visibility = "visible";
      this._overlayElement.style.opacity = "1";
      // Render overlay items as DOM elements
      this._overlayElement.innerHTML = "";
      this.config.items.forEach(i => {
        const key = this.config.mode === "text" ? i.value : i.entity;
        const checked = this._getState(key);
        const itemDiv = document.createElement("div");
        itemDiv.className = "item";
        itemDiv.style.display = "flex";
        itemDiv.style.alignItems = "center";
        itemDiv.style.gap = "12px";
        itemDiv.style.padding = "8px 12px";
        itemDiv.style.height = "40px";
        itemDiv.style.whiteSpace = "nowrap";
        itemDiv.style.color = "var(--primary-text-color)";
        itemDiv.style.background = checked ? "rgba(68,115,158,0.08)" : "";

        // HA Checkbox
        const haCheckbox = document.createElement("ha-checkbox");
        haCheckbox.setAttribute("aria-label", i.name);
        haCheckbox.checked = checked;
        haCheckbox.style.marginRight = "8px";
        haCheckbox.style.setProperty("--mdc-theme-secondary", "var(--primary-color)");
        haCheckbox.addEventListener("click", ev => {
          ev.stopPropagation();
          this._togglePendingState(key);
          this._renderOverlayItems();
        });

        // Item label
        const label = document.createElement("span");
        label.textContent = i.name;
        label.style.fontSize = "16px";
        label.style.fontFamily = "Roboto, sans-serif";

        // Item click toggles state
        itemDiv.addEventListener("click", () => {
          this._togglePendingState(key);
          this._renderOverlayItems();
        });

        itemDiv.appendChild(haCheckbox);
        itemDiv.appendChild(label);
        this._overlayElement.appendChild(itemDiv);
      });

      // Helper to re-render overlay items
      this._renderOverlayItems = () => {
        if (!this._overlayElement) return;
        this._overlayElement.innerHTML = "";
        this.config.items.forEach(i => {
          const key = this.config.mode === "text" ? i.value : i.entity;
          const checked = this._getState(key);
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";
          itemDiv.style.display = "flex";
          itemDiv.style.alignItems = "center";
          itemDiv.style.gap = "12px";
          itemDiv.style.padding = "8px 12px";
          itemDiv.style.height = "40px";
          itemDiv.style.whiteSpace = "nowrap";
          itemDiv.style.color = "var(--primary-text-color)";
          itemDiv.style.background = checked ? "rgba(68,115,158,0.08)" : "";

          // HA Checkbox
          const haCheckbox = document.createElement("ha-checkbox");
          haCheckbox.setAttribute("aria-label", i.name);
          haCheckbox.checked = checked;
          haCheckbox.style.marginRight = "8px";
          haCheckbox.style.setProperty("--mdc-theme-secondary", "var(--primary-color)");
          haCheckbox.addEventListener("click", ev => {
            ev.stopPropagation();
            this._togglePendingState(key);
            this._renderOverlayItems();
          });

          const label = document.createElement("span");
          label.textContent = i.name;
          label.style.fontSize = "16px";
          label.style.fontFamily = "Roboto, sans-serif";

          itemDiv.addEventListener("click", () => {
            this._togglePendingState(key);
            this._renderOverlayItems();
          });

          itemDiv.appendChild(haCheckbox);
          itemDiv.appendChild(label);
          this._overlayElement.appendChild(itemDiv);
        });
      };

      document.body.appendChild(this._overlayElement);
      // Nach dem Rendern: Bei "up" die Höhe ermitteln und Position korrigieren
      if (this._direction === "up") {
        // Timeout für Layout
        setTimeout(() => {
          const overlayHeight = this._overlayElement.offsetHeight;
          this._overlayElement.style.top = `${rect.top + window.scrollY - overlayHeight}px`;
        }, 0);
      }
      // Klick außerhalb schließt Overlay
      this._overlayElement.addEventListener("click", (ev) => ev.stopPropagation());
      document.addEventListener("click", this._closeOverlay = () => {
        this._commitChanges();
        this._open = false;
        if (this._overlayElement) {
          document.body.removeChild(this._overlayElement);
          this._overlayElement = null;
        }
        document.removeEventListener("click", this._closeOverlay);
        this.requestUpdate();
      }, { once: true });
    } else {
      // Beim Schließen: Änderungen committen
      this._commitChanges();
      if (this._overlayElement) {
        document.body.removeChild(this._overlayElement);
        this._overlayElement = null;
      }
      document.removeEventListener("click", this._closeOverlay);
    }

    this._open = !this._open;
    if (!this._open && e?.currentTarget) {
      e.currentTarget.blur();
    }
  }

  static styles = css`
    :host {
      display: block;
    }

    /* ===== HA CARD - Entity Row Pattern ===== */
    ha-card {
      border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, rgba(0, 0, 0, 0.12)));
      box-shadow: var(--ha-card-box-shadow, 0 2px 1px -1px rgba(0, 0, 0, 0.2));
    }

    /* ===== ENTITY ROW - Time Spinner Card Style ===== */
    .row {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      min-height: 56px;
      box-sizing: border-box;
    }

    /* ===== ICON - State Badge 40px ===== */
    ha-icon {
      flex: 0 0 40px;
      padding: 8px;
      color: var(--state-icon-color, var(--paper-item-icon-color, #44739e));
    }

    /* ===== NAME - Info Text ===== */
    .name {
      margin-left: 4px;
      margin-inline-start: 4px;
      margin-inline-end: initial;
      padding-right: 5px;
      padding-inline-end: 5px;
      flex: 1;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ===== SELECT BUTTON - Time Button Style ===== */
    .value-container {
      position: relative;
      width: 50%;
      min-width: 0;
      flex-shrink: 0;
      margin-left: 5px;
      margin-inline-start: 5px;
      margin-inline-end: initial;
      direction: var(--direction);
    }

    .value {
      padding: 8px 5px 8px 12px;
      height: 40px;
      border: none;
      border-bottom: 1px solid var(--mdc-text-field-idle-line-color, rgba(0, 0, 0, 0.42));
      border-radius: 4px 4px 0 0;
      background: var(--mdc-text-field-fill-color, whitesmoke);
      color: var(--primary-text-color);
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      transition: border-color 0.2s, background-color 0.2s;
      box-sizing: border-box;
      position: relative;
      width: 100%;
    }

    .value-label {
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6));
      white-space: nowrap;
      font-family: Roboto, sans-serif;
      font-weight: 400;
      pointer-events: none;
    }

    .value:hover {
      background: rgba(255, 255, 255, 0.1);
      border-bottom-color: var(--mdc-text-field-hover-line-color, rgba(0, 0, 0, 0.87));
    }

    .value:focus-visible {
      outline: none;
      background: var(--mdc-text-field-hover-fill-color, var(--mdc-text-field-fill-color, whitesmoke));
      border-bottom: 2px solid var(--mdc-theme-primary, var(--primary-color));
    }

    .value:active {
      background: var(--mdc-text-field-hover-fill-color, var(--mdc-text-field-fill-color, whitesmoke));
      border-bottom: 2px solid var(--mdc-theme-primary, var(--primary-color));
    }

    .value.open {
      border-bottom-color: var(--mdc-theme-primary, var(--primary-color));
    }

    /* ===== ARROW ICON ===== */
    .arrow {
      opacity: 0.6;
      color: var(--primary-text-color);
      flex: 0 0 auto;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 4px;
    }

    .value.open .arrow {
      opacity: 1;
      color: var(--mdc-theme-primary, var(--primary-color));
    }

    /* ===== VALUE TEXT ===== */
    .value-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1 1 auto;
      min-width: 0;
      text-align: left;
    }

    /* ===== OVERLAY - Dropdown ===== */
    .overlay {
      position: absolute;
      left: 0;
      z-index: 10;
      background: var(--card-background-color);
      padding: 6px 0;
      width: 100%;
      max-height: 50vh;
      overflow-y: auto;
      animation: open 120ms ease-out;
      border-radius: 0 0 4px 4px;
    }

    .overlay.down {
      top: calc(100% + 6px);
    }

    .overlay.up {
      bottom: calc(100% + 6px);
    }

    @keyframes open {
      from {
        opacity: 0;
        transform: scale(0.97);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* ===== ITEM - Dropdown Item ===== */
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      height: 40px;
      white-space: nowrap;
      color: var(--primary-text-color);
    }

    .item:hover {
      background: rgba(var(--rgb-primary-color), 0.2);
    }
  `;


  /* ===== Toggle entity (nur pending state) ===== */

  _togglePendingState(key) {
    this._pendingStates[key] = !this._pendingStates[key];
    this.requestUpdate();
  }

  /* ===== Commit changes to Home Assistant ===== */

  _commitChanges() {
    if (!this._pendingStates || Object.keys(this._pendingStates).length === 0) return;
    if (this.config.mode === "text") {
      // Text-Modus: Werte sammeln und in text_entity schreiben
      const selectedArr = this.config.items
        .filter(item => this._pendingStates[item.value])
        .map(item => item.value);
      // Prüfen, ob vorher ein JSON-Array gespeichert war
      const textVal = this.hass.states[this.config.text_entity]?.state || "";
      let writeValue = "";
      if (textVal.trim().startsWith("[") && textVal.trim().endsWith("]")) {
        writeValue = JSON.stringify(selectedArr);
      } else {
        writeValue = selectedArr.join(",");
      }
      // Service je nach Entity-Typ wählen
      let domain = "input_text";
      if (this.config.text_entity.startsWith("text.")) {
        domain = "text";
      }
      this.hass.callService(domain, "set_value", {
        entity_id: this.config.text_entity,
        value: writeValue,
      });
    } else {
      // Boolean-Modus wie bisher
      this.config.items.forEach(item => {
        const currentState = this.hass.states[item.entity]?.state === "on";
        const pendingState = this._pendingStates[item.entity];
        if (currentState !== pendingState) {
          this.hass.callService("input_boolean", pendingState ? "turn_on" : "turn_off", {
            entity_id: item.entity,
          });
        }
      });
    }
    this._pendingStates = {};
  }

  /* ===== Get state (pending oder real) ===== */

  _getState(keyOrEntity) {
    if (this.config.mode === "text") {
      // Text-Modus: key = value
      if (this._open && this._pendingStates.hasOwnProperty(keyOrEntity)) {
        return this._pendingStates[keyOrEntity];
      }
      // Im geschlossenen Zustand: aus text_entity lesen (String oder JSON-Array)
      const textVal = this.hass.states[this.config.text_entity]?.state || "";
      let selected = [];
      try {
        if (textVal.trim().startsWith("[") && textVal.trim().endsWith("]")) {
          selected = JSON.parse(textVal);
          if (!Array.isArray(selected)) selected = [];
          selected = selected.map(String);
        } else {
          selected = textVal.split(",").map(s => s.trim()).filter(Boolean);
        }
      } catch (e) {
        selected = [];
      }
      return selected.includes(String(keyOrEntity));
    } else {
      // Boolean-Modus wie bisher
      if (this._open && this._pendingStates.hasOwnProperty(keyOrEntity)) {
        return this._pendingStates[keyOrEntity];
      }
      return this.hass.states[keyOrEntity]?.state === "on";
    }
  }

  /* ===== Summary ===== */

  _summary() {
    const items = this.config.items;
    let selected;
    if (this.config.mode === "text") {
      // Text-Modus: selected = Indizes der gewählten Werte
      let selectedVals = [];
      if (this._open && this._pendingStates) {
        // Live: pending state
        selectedVals = items
          .map(i => this._pendingStates[i.value] ? String(i.value) : null)
          .filter(v => v !== null);
      } else {
        // Geschlossen: aus Entity
        const textVal = this.hass.states[this.config.text_entity]?.state || "";
        selectedVals = textVal.split(",").map(s => s.trim()).filter(Boolean);
      }
      selected = items
        .map((i, idx) => selectedVals.includes(String(i.value)) ? idx : null)
        .filter(i => i !== null);
    } else {
      // Boolean-Modus wie bisher
      selected = items
        .map((i, idx) => this._getState(i.entity) ? idx : null)
        .filter(i => i !== null);
    }

    if (!selected.length) return "—";

    if (!this.config.item_summarize) {
      return selected.map(i => items[i].short || items[i].name).join(", ");
    }

    const ranges = [];
    let start = selected[0];
    let prev = start;

    for (let i = 1; i < selected.length; i++) {
      if (selected[i] === prev + 1) {
        prev = selected[i];
      } else {
        ranges.push([start, prev]);
        start = selected[i];
        prev = selected[i];
      }
    }
    ranges.push([start, prev]);

    return ranges
      .map(([a, b]) => {
        if (a === b) {
          return items[a].short || items[a].name;
        }
        if (b === a + 1) {
          return `${items[a].short || items[a].name}, ${items[b].short || items[b].name}`;
        }
        return `${items[a].short || items[a].name} – ${items[b].short || items[b].name}`;
      })
      .join(", ");
  }

  render() {
    const iconColor =
      this.config.icon_color || "var(--paper-item-icon-color)";

    return html`
      <ha-card>
        <div class="row">
          <ha-icon
            class="icon"
            icon="${this.config.icon || "mdi:calendar"}"
            style="color:${iconColor}">
          </ha-icon>

          <div class="name">${this.config.name || "Auswahl"}</div>

          <div class="value-container">
            <div class="value ${this._open ? "open" : ""}" id="anchor" @click=${this._toggleMenu}>
              <span class="value-text">${this._summary()}</span>
              <ha-icon
                class="arrow"
                icon="${this._open ? "mdi:menu-up" : "mdi:menu-down"}">
              </ha-icon>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define("multiselect-dropdown", MultiSelectDropdown);

class MultiSelectDropdownEditor extends LitElement {
  static properties = {
    hass: {},
    config: {},
    _editingIndex: { type: Number },
    _editingItem: { type: Object },
    _isNewItem: { type: Boolean },
  };

  constructor() {
    super();
    this._editingIndex = null;
    this._editingItem = null;
    this._isNewItem = false;
  }

  static styles = css`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .option {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .option label {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item-entry {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 40px;
      padding: 8px;
      background: var(--mdc-theme-surface, #fff);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
    }

    .item-name {
      flex: 1;
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .item-actions {
      display: flex;
      gap: 8px;
    }

    ha-icon {
      cursor: pointer;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }

    ha-icon:hover {
      color: var(--primary-text-color);
    }

    .edit-dialog {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      background: var(--mdc-theme-surface, #fff);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      margin-top: 8px;
    }

    .dialog-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    ha-textfield {
      width: 100%;
      min-width: 0;
      display: block;
    }

    mwc-button {
      align-self: flex-start;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    mwc-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `;

  setConfig(config) {
    this.config = {
      item_summarize: false,
      items: [],
      ...config,
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const items = this.config.items || [];
    const mode = this.config.mode || "boolean";

    return html`
      <div class="card-config">
        <div class="option">
          <label>Name</label>
          <ha-textfield
            .value=${this.config.name || ""}
            .placeholder=${"Wochentage"}
            @input=${this._nameChanged}
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Icon</label>
          <ha-icon-picker
            .hass=${this.hass}
            .value=${this.config.icon || "mdi:calendar-expand-horizontal-outline"}
            @value-changed=${this._iconChanged}
          ></ha-icon-picker>
        </div>

        <div class="option">
          <label>Icon Farbe</label>
          <ha-textfield
            .value=${this.config.icon_color || ""}
            .placeholder=${"#44739e"}
            @input=${this._iconColorChanged}
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Modus</label>
          <ha-select
            .value=${mode}
            @selected=${e => this._modeChanged(e)}
          >
            <mwc-list-item value="boolean">Boolean (input_boolean)</mwc-list-item>
            <mwc-list-item value="text">Text (input_text)</mwc-list-item>
          </ha-select>
        </div>

        ${mode === "text" ? html`
          <div class="option">
            <label>Text Entity</label>
            <ha-textfield
              .value=${this.config.text_entity || ""}
              .placeholder=${"input_text.irrigation_days"}
              @input=${this._textEntityChanged}
            ></ha-textfield>
          </div>
        ` : ""}

        <div class="option">
          <label>Zusammenfassen</label>
          <ha-switch
            .checked=${Boolean(this.config.item_summarize)}
            @change=${this._summarizeChanged}
          ></ha-switch>
        </div>

        <div class="option">
          <label>Items</label>
          <div class="items-list">
            ${items.map((item, index) => html`
              <div>
                ${this._editingIndex === index 
                  ? this._renderEditDialog(index, mode) 
                  : html`
                      <div class="item-entry">
                        <div class="item-name">${item.name || "(leer)"}</div>
                        <div class="item-actions">
                          <ha-icon
                            icon="mdi:pencil"
                            @click=${() => this._startEdit(index)}
                            title="Bearbeiten"
                          ></ha-icon>
                          <ha-icon
                            icon="mdi:delete"
                            @click=${() => this._removeItem(index)}
                            title="Löschen"
                          ></ha-icon>
                        </div>
                      </div>
                    `
                }
              </div>
            `)}
          </div>
          ${this._isNewItem ? this._renderEditDialog(null, mode) : ""}
          <mwc-button @click=${this._addItem}>
            <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
            Item hinzufügen
          </mwc-button>
        </div>
      </div>
    `;
  }

  _renderEditDialog(index, mode) {
    const item = this._editingItem;
    return html`
      <div class="edit-dialog">
        <ha-textfield
          .value=${item.name || ""}
          label="Name"
          @input=${(e) => (this._editingItem = { ...this._editingItem, name: e.target.value })}
        ></ha-textfield>
        <ha-textfield
          .value=${item.short || ""}
          label="Kurz (short)"
          @input=${(e) => (this._editingItem = { ...this._editingItem, short: e.target.value })}
        ></ha-textfield>
        ${mode === "text" ? html`
          <ha-textfield
            .value=${item.value || ""}
            label="Wert (value)"
            .placeholder=${"mon"}
            @input=${(e) => (this._editingItem = { ...this._editingItem, value: e.target.value })}
          ></ha-textfield>
        ` : html`
          <ha-textfield
            .value=${item.entity || ""}
            label="Entity"
            .placeholder=${"input_boolean.example"}
            @input=${(e) => (this._editingItem = { ...this._editingItem, entity: e.target.value })}
          ></ha-textfield>
        `}
        <div class="dialog-actions">
          <mwc-button @click=${this._cancelEdit}>Abbrechen</mwc-button>
          <mwc-button @click=${this._saveEdit}>Speichern</mwc-button>
        </div>
      </div>
    `;
  }

  _modeChanged(e) {
    const value = e.target.value || e.detail.value;
    this._fireConfigChanged({ ...this.config, mode: value });
  }

  _textEntityChanged(e) {
    this._fireConfigChanged({ ...this.config, text_entity: e.target.value });
  }

  _startEdit(index) {
    const items = this.config.items || [];
    this._editingIndex = index;
    this._editingItem = { ...items[index] };
  }

  _saveEdit() {
    const items = [...(this.config.items || [])];
    
    if (this._isNewItem) {
      // Neues Item zur Liste hinzufügen
      items.push(this._editingItem);
    } else {
      // Bestehendes Item aktualisieren
      items[this._editingIndex] = this._editingItem;
    }
    
    this._editingIndex = null;
    this._editingItem = null;
    this._isNewItem = false;
    this._fireConfigChanged({ ...this.config, items });
  }

  _cancelEdit() {
    this._editingIndex = null;
    this._editingItem = null;
    this._isNewItem = false;
  }

  _addItem() {
    // Dialog für neues Item öffnen (ohne zur Config hinzuzufügen)
    this._editingIndex = null;  // Keine Index für neues Item
    this._editingItem = { name: "", short: "", entity: "" };
    this._isNewItem = true;
    this.requestUpdate();
  }

  _removeItem(index) {
    const items = [...(this.config.items || [])];
    items.splice(index, 1);
    this._fireConfigChanged({ ...this.config, items });
  }

  _nameChanged(e) {
    this._fireConfigChanged({ ...this.config, name: e.target.value });
  }

  _iconChanged(e) {
    this._fireConfigChanged({ ...this.config, icon: e.detail.value });
  }

  _iconColorChanged(e) {
    this._fireConfigChanged({ ...this.config, icon_color: e.target.value });
  }

  _summarizeChanged(e) {
    this._fireConfigChanged({ ...this.config, item_summarize: e.target.checked });
  }

  _fireConfigChanged(config) {
    const event = new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define("multiselect-dropdown-editor", MultiSelectDropdownEditor);
