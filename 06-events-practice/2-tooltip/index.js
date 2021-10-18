class Tooltip {
  static tooltip;

  container;
  element;
  content;
  cursorShift = 10;

  tooltipsCache = new Map();
  tooltipActive;

  clientX;
  clientY;

  constructor() {
    if (Tooltip.tooltip) return Tooltip.tooltip;
    Tooltip.tooltip = this;

    this.onPointerOver = this.onPointerOver.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  render(content = "") {
    this.content = content;
    this.element = this.tooltipsCache.has(content)
      ? this.tooltipsCache.get(content)
      : htmlToElement(this.template);
    this.element = htmlToElement(this.template);
    this.setTooltipPosition(this.clientX, this.clientY);
    document.body.append(this.element);
  }

  get template() {
    return `<div class="tooltip">${this.content}</div>`;
  }

  initialize(container = document) {
    this.container = container;
    this.addListeners(this.container);
  }

  addListeners(container = document) {
    container.addEventListener("pointerover", this.onPointerOver);
    container.addEventListener("pointerout", this.onPointerOut);
    container.addEventListener("mousemove", this.onMouseMove);
  }

  removeListeners(container = document) {
    container.removeEventListener("pointerover", this.onPointerOver);
    container.removeEventListener("pointerout", this.onPointerOut);
    container.removeEventListener("mousemove", this.onMouseMove);
  }

  onPointerOver(evt) {
    // console.log("over evt:", evt);
    if (!this.gotTooltip(evt.target)) return;
    // console.log("adding tooltip...");

    this.clientX = evt.clientX + this.cursorShift;
    this.clientY = evt.clientY + this.cursorShift;

    const newTooltipContent = this.getTooltipContent(evt.target);
    this.render(newTooltipContent);

    this.tooltipActive = true;
  }

  onMouseMove(evt) {
    if (!this.tooltipActive) return;
    this.setTooltipPosition(evt.clientX, evt.clientY);
  }

  onPointerOut(evt) {
    // console.log("out evt:", evt);
    if (!this.gotTooltip(evt.target)) return;
    // console.log("removing tooltip...");
    this.tooltipsCache.set(this.content, this.element);
    this.remove();
    this.tooltipActive = false;
  }

  setTooltipPosition(left, top) {
    this.element.style.left = left + this.cursorShift + "px";
    this.element.style.top = top + this.cursorShift + "px";
  }

  gotTooltip(el) {
    return el.dataset && el.dataset.tooltip;
  }

  getTooltipContent(el) {
    return el.dataset.tooltip;
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.tooltipsCache.clear();
    // NOTE: expression argument fixes last unit test
    this.removeListeners(this.container || document);
    this.container = null;
    this.element = null;
  }
}

export default Tooltip;

function htmlToElement(html) {
  // const template = document.createElement("template");
  // template.innerHTML = html.trim();
  // return template.content.firstChild;
  const div = document.createElement("div");
  div.insertAdjacentHTML("afterbegin", html.trim());
  return div.firstChild;
}
