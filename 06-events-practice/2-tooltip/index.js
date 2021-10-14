class Tooltip {
  element;
  static tooltip;

  constructor() {
    if (Tooltip.tooltip) return Tooltip.tooltip;
    this.onPointerOverTooltip = this.onPointerOverTooltip.bind(this);
    this.render();
  }

  render(template = this.template) {
    this.element = htmlToElement(template);
  }

  get template() {
    return `<div class="tooltip">This is tooltip</div>`;
  }

  initialize() {
    this.addListeners();
  }

  addListeners() {
    document.addEventListener("pointerover", this.onPointerOverTooltip);
  }

  removeListeners() {
    document.removeEventListener("pointerover", this.onPointerOverTooltip);
  }

  onPointerOverTooltip(evt) {
    console.log("Evt:", evt);
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeListeners();
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
