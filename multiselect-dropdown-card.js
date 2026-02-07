import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

class MultiSelectDropdown extends LitElement {

  static properties = {
    hass: {},
    config: {},
    _open: { state: true },
    _direction: { state: true }, // up | down
  };

  constructor() {
    super();
    this._open = false;
    this._direction = "down";
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

  setConfig(config) {
    if (!Array.isArray(config.items)) {
      throw new Error("items missing");
    }

    this.config = {
      item_summarize: false,
      ...config,
    };
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
      this._open = false;
    }
  }

  /* ===== Toggle dropdown ===== */
  _toggleMenu(e) {
    e.stopPropagation();

    const anchor = this.shadowRoot.getElementById("anchor");
    const rect = anchor.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    this._direction =
      spaceBelow < 250 && spaceAbove > spaceBelow ? "up" : "down";

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


  /* ===== Toggle entity ===== */
  _toggleEntity(entity) {
    this.hass.callService("input_boolean", "toggle", {
      entity_id: entity,
    });
  }

  /* ===== Summary ===== */
  _summary() {
    const items = this.config.items;

    const selected = items
      .map((i, idx) =>
        this.hass.states[i.entity]?.state === "on" ? idx : null
      )
      .filter(i => i !== null);

    if (!selected.length) return "—";

    if (!this.config.item_summarize || selected.length < 3) {
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
      .map(([a, b]) =>
        a === b
          ? items[a].short || items[a].name
          : `${items[a].short || items[a].name} – ${items[b].short || items[b].name}`
      )
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

            ${this._open ? html`
              <div class="overlay ${this._direction}">
                ${this.config.items.map(i => html`
                  <div class="item" @click=${(e) => { e.stopPropagation(); this._toggleEntity(i.entity); }}>
                    <ha-checkbox
                      .checked=${this.hass.states[i.entity]?.state === "on"}
                      @change=${() => this._toggleEntity(i.entity)}>
                    </ha-checkbox>
                    <span>${i.name}</span>
                  </div>
                `)}
              </div>
            ` : ""}
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
            `)}
          </div>
          ${this._editingIndex !== null || this._isNewItem ? this._renderEditDialog() : ""}
          <mwc-button @click=${this._addItem}>
            <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
            Item hinzufügen
          </mwc-button>
        </div>
      </div>
    `;
  }

  _renderEditDialog() {
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
        <ha-textfield
          .value=${item.entity || ""}
          label="Entity"
          @input=${(e) => (this._editingItem = { ...this._editingItem, entity: e.target.value })}
        ></ha-textfield>
        <div class="dialog-actions">
          <mwc-button @click=${this._cancelEdit}>Abbrechen</mwc-button>
          <mwc-button @click=${this._saveEdit}>Speichern</mwc-button>
        </div>
      </div>
    `;
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
