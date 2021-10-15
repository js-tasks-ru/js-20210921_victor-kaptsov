class Tooltip {
  static tooltip;

  container;
  element;
  content;
  cursorShift = 10;

  tooltipsMap = new Map();
  tooltipActive;

  clientX;
  clientY;

  constructor() {
    if (Tooltip.tooltip) return Tooltip.tooltip;
    Tooltip.tooltip = this;

    this.onPointerOverTooltip = this.onPointerOverTooltip.bind(this);
    this.onPointerOutTooltip = this.onPointerOutTooltip.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  render(content = "") {
    // console.log("rendering tooltip from content and template");
    this.content = content;
    this.element = htmlToElement(this.template);
    this.setTooltipPosition(this.clientX, this.clientY);
    document.body.append(this.element);
  }

  restore(content) {
    // console.log("restoring tooltip from Map");
    this.content = content;
    this.element = this.tooltipsMap.get(content);
    this.setTooltipPosition(this.clientX, this.clientY);
    document.body.append(this.element);
  }

  get template() {
    return `<div class="tooltip">${this.content}</div>`;
  }

  initialize(container = document) {
    this.container = container;
    this.addListeners(container);
  }

  addListeners(container) {
    container.addEventListener("pointerover", this.onPointerOverTooltip);
    container.addEventListener("pointerout", this.onPointerOutTooltip);
    container.addEventListener("mousemove", this.onMouseMove);
  }

  removeListeners(container) {
    container.removeEventListener("pointerover", this.onPointerOverTooltip);
    container.removeEventListener("pointerout", this.onPointerOutTooltip);
    container.removeEventListener("mousemove", this.onMouseMove);
  }

  onPointerOverTooltip(evt) {
    // console.log("over evt:", evt);
    if (!this.gotTooltip(evt.target)) return;
    // console.log("adding tooltip...");

    this.clientX = evt.clientX + this.cursorShift;
    this.clientY = evt.clientY + this.cursorShift;

    const newTooltipContent = evt.target.dataset.tooltip;
    if (this.tooltipsMap.has(newTooltipContent)) {
      this.restore(newTooltipContent);
    } else {
      this.render(newTooltipContent);
    }

    this.tooltipActive = true;
  }

  onMouseMove(evt) {
    if (!this.tooltipActive) return;
    this.setTooltipPosition(evt.clientX, evt.clientY);
  }

  onPointerOutTooltip(evt) {
    // console.log("out evt:", evt);
    if (!this.gotTooltip(evt.target)) return;
    // console.log("removing tooltip...");
    this.tooltipsMap.set(this.content, this.element);
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

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.tooltipsMap.clear();
    this.removeListeners(this.container);
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
