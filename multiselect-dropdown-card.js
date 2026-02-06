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

  static styles = css`
    :host {
      display: block;
    }

    /* ===== HA CARD ===== */
    ha-card {
      border-radius: var(--ha-card-border-radius, 12px);
      border: var(--ha-card-border-width, 1px) solid var(--divider-color);
      background: var(--card-background-color);
      overflow: visible;
    }

    /* ===== ROW ===== */
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
    }

    .icon {
      flex-shrink: 0;
    }

    .name {
      flex: 1;
      min-width: 0;
    }

    /* ===== VALUE ===== */
    .value-container {
      position: relative;
      width: 50%;
      min-width: 0;
    }

    .value {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      gap: 6px;
      background: var(--secondary-background-color);
      border-radius: 12px;
      cursor: pointer;
      user-select: none;
    }

    .value-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ===== ARROW ===== */
    .arrow {
      opacity: 0.6;
      transform: rotate(0deg);
      transition: transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .arrow.open {
      color: var(--primary-color);
      opacity: 0.6;
      transform: rotate(180deg);
    }

    /* ===== OVERLAY ===== */
    .overlay {
      position: absolute;
      left: 0;
      z-index: 10;
      background: var(--secondary-background-color);
      border-radius: 12px;
      padding: 6px 0;
      min-width: calc(100% + 20px);
      max-height: 50vh;
      overflow-y: auto;
      animation: open 120ms ease-out;
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

    /* ===== ITEM ===== */
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      white-space: nowrap;
    }

    .item:hover {
      background: rgba(var(--rgb-primary-color), 0.08);
    }
  `;

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
  }

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
            <div class="value" id="anchor" @click=${this._toggleMenu}>
              <span class="value-text">${this._summary()}</span>
              <ha-icon
                class="arrow ${this._open ? "open" : ""}"
                icon="mdi:menu-down">
              </ha-icon>
            </div>

            ${this._open ? html`
              <div class="overlay ${this._direction}">
                ${this.config.items.map(i => html`
                  <div class="item" @click=${e => e.stopPropagation()}>
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
