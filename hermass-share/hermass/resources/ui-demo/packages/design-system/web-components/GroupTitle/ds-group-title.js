(function registerDSGroupTitle() {
  const tagName = 'ds-group-title'
  if (customElements.get(tagName)) return

  const template = document.createElement('template')
  template.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        min-width: 0;
        color: var(--ds-color-black, #000);
        font-family: var(
          --ds-font-family,
          "PingFang SC",
          -apple-system,
          BlinkMacSystemFont,
          "Helvetica Neue",
          "Microsoft YaHei",
          Arial,
          sans-serif
        );
      }

      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      .group-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-4, 16px);
        width: 100%;
        height: 38px;
        min-width: 0;
        padding: 8px 16px;
        color: var(--ds-color-black, #000);
        background: var(
          --ds-color-group-title-bg,
          linear-gradient(90deg, #f0f6ff 0%, rgba(245, 245, 255, 0.1) 100%)
        );
        border-radius: var(--ds-radius-sm, 4px);
      }

      .main {
        display: flex;
        align-items: center;
        min-width: 0;
        gap: var(--ds-space-1, 4px);
      }

      .text {
        min-width: 0;
        overflow: hidden;
        color: var(--ds-color-black, #000);
        font-size: var(--ds-font-size-md, 14px);
        font-weight: var(--ds-font-weight-semibold, 600);
        line-height: var(--ds-line-height-md, 22px);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      slot[name="leading"],
      slot[name="extra"] {
        display: contents;
      }

      ::slotted([slot="leading"]),
      ::slotted([slot="extra"]) {
        display: inline-flex;
        flex: none;
        align-items: center;
      }

      ::slotted([slot="extra"]) {
        color: var(--ds-color-text-secondary, #4e5969);
        font-size: var(--ds-font-size-sm, 13px);
        line-height: var(--ds-line-height-sm, 20px);
      }

      :host([title]) .default-title {
        display: none;
      }

      :host(:not([title])) .attribute-title {
        display: none;
      }
    </style>

    <div class="group-title" part="container" role="heading" aria-level="1">
      <div class="main" part="main">
        <slot name="leading"></slot>
        <span class="text" part="text">
          <span class="attribute-title"></span>
          <span class="default-title"><slot></slot></span>
        </span>
      </div>
      <slot name="extra"></slot>
    </div>
  `

  class DSGroupTitleElement extends HTMLElement {
    static get observedAttributes() {
      return ['title', 'level']
    }

    constructor() {
      super()
      this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true))
      this.headingElement = this.shadowRoot.querySelector('.group-title')
      this.titleElement = this.shadowRoot.querySelector('.attribute-title')
      this.textElement = this.shadowRoot.querySelector('.text')
    }

    connectedCallback() {
      this.syncAttributes()
    }

    attributeChangedCallback() {
      this.syncAttributes()
    }

    syncAttributes() {
      const title = this.getAttribute('title') || ''
      const parsedLevel = Number.parseInt(this.getAttribute('level'), 10)
      const level = Number.isInteger(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 6
        ? parsedLevel
        : 1

      this.headingElement.setAttribute('aria-level', String(level))
      this.titleElement.textContent = title

      if (title) {
        this.textElement.setAttribute('title', title)
      } else {
        this.textElement.removeAttribute('title')
      }
    }
  }

  customElements.define(tagName, DSGroupTitleElement)
})()
