export default class DoubleSlider {
  element;
  subElements;
  draggedThumb;
  pBarWidthAbs;
  pBarBoundaryLeftAbs;
  pBarBoundaryRightAbs;
  pixelsInPercent;
  progressPercent;
  selectionBoundaryLeft;
  selectionBoundaryRight;

  constructor({
    min = 0,
    max = 100,
    formatValue = (x) => x,
    selected = {
      from: min,
      to: max,
    },
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;

    // NOTE: Human-readable formatting:
    this.formatValue = formatValue;

    // NOTE: math stuff
    this.progressPercent = (max - min) / 100;
    this.selectionBoundaryLeft = this._translateToPercentage(
      this.selected.from - this.min
    );
    this.selectionBoundaryRight = this._translateToPercentage(
      this.max - this.selected.to
    );

    // NOTE: init DOM, save elements to cache
    this.element = htmlToElement(this.template);
    this.subElements = this.getSubElements(this.element);

    window.elX = this;

    // NOTE: init event handling
    this.addListeners();
  }

  get template() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner" data-element="inner">
          <span class="range-slider__progress" data-element="progress" style="left: ${
            this.selectionBoundaryLeft
          }%; right: ${this.selectionBoundaryRight}%"></span>
          <span class="range-slider__thumb-left" data-element="thumbLeft" style="left: ${
            this.selectionBoundaryLeft
          }%"></span>
          <span class="range-slider__thumb-right" data-element="thumbRight" style="right: ${
            this.selectionBoundaryRight
          }%"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;
  }

  _translateToPercentage(absoluteNumber) {
    return absoluteNumber / this.progressPercent;
  }

  addListeners() {
    this.subElements.thumbLeft.addEventListener(
      "pointerdown",
      this._prepareThumbDrag
    );
    this.subElements.thumbRight.addEventListener(
      "pointerdown",
      this._prepareThumbDrag
    );
  }

  removeListeners() {
    if (this.subElements) {
      this.subElements.thumbLeft.removeEventListener(
        "pointerdown",
        this._prepareThumbDrag
      );
      this.subElements.thumbRight.removeEventListener(
        "pointerdown",
        this._prepareThumbDrag
      );

      document.removeEventListener("pointermove", this._dragThumb);
      document.removeEventListener("pointerup", this._dropThumb);
    }
  }

  _prepareThumbDrag = (evt) => {
    // console.log("_prepareThumbDrag()");

    document.addEventListener("pointermove", this._dragThumb);
    document.addEventListener("pointerup", this._dropThumb);

    // NOTE: get DOM elements sizes, if none
    if (!this.pBarWidthAbs) {
      const progressBarStyles = this.subElements.inner.getBoundingClientRect();

      this.pBarWidthAbs = progressBarStyles.width;
      this.pBarBoundaryLeftAbs = progressBarStyles.x;
      this.pBarBoundaryRightAbs = progressBarStyles.x + progressBarStyles.width;

      this.pixelsInPercent = this.pBarWidthAbs / 100;
    }

    const draggedThumbStyles = evt.currentTarget.style;
    this.draggedThumb = {
      el: evt.currentTarget,
      // TODO: next two checks is based on layout styles, not very reliable!
      side: draggedThumbStyles.left ? "left" : "right",
      posPercent: draggedThumbStyles.left
        ? parseFloat(draggedThumbStyles.left)
        : parseFloat(draggedThumbStyles.right),
      posAbs: evt.currentTarget.getBoundingClientRect().x || 0,
    };
  };

  _dragThumb = (evt) => {
    // console.log("_dragThumb()");
    if (!this.draggedThumb) return;
    if (!this.subElements) return;

    let newX = evt.clientX;
    if (newX < this.pBarBoundaryLeftAbs) newX = this.pBarBoundaryLeftAbs;
    if (newX > this.pBarBoundaryRightAbs) newX = this.pBarBoundaryRightAbs;

    const horizontalDragAmount = newX - this.draggedThumb.posAbs;
    const dragInPercents = parseFloat(
      horizontalDragAmount / this.pixelsInPercent
    );

    // Note: fix for unit test #4
    if (newX === 0) this.draggedThumb.posPercent = 0;

    switch (this.draggedThumb.side) {
      case "left":
        // Update draggedThumb object saved position:
        this.draggedThumb.posPercent += dragInPercents;

        // Note: fix thumbs overflows
        this.selectionBoundaryLeft = Math.floor(this.draggedThumb.posPercent);
        if (this.selectionBoundaryLeft < 0) {
          this.selectionBoundaryLeft = 0;
          this.draggedThumb.posPercent = this.selectionBoundaryLeft;
        } else if (
          this.selectionBoundaryLeft >
          100 - this.selectionBoundaryRight
        ) {
          this.selectionBoundaryLeft = 100 - this.selectionBoundaryRight;
          this.draggedThumb.posPercent = this.selectionBoundaryLeft;
        }

        // Update selected minimum value in DOM:
        this.selected.from =
          this.min + this.selectionBoundaryLeft * this.progressPercent;
        this.subElements.from.textContent = this.formatValue(
          this.selected.from
        );

        // Update selection in DOM:
        const newLeftPosition = this.draggedThumb.posPercent + "%";
        this.draggedThumb.el.style.left = newLeftPosition;
        this.subElements.progress.style.left = newLeftPosition;

        break;
      case "right":
        // Update draggedThumb object saved position:
        this.draggedThumb.posPercent -= dragInPercents;

        // Note: fix thumbs overflows
        this.selectionBoundaryRight = Math.ceil(this.draggedThumb.posPercent);
        if (this.selectionBoundaryRight < 0) {
          this.selectionBoundaryRight = 0;
          this.draggedThumb.posPercent = 0;
        } else if (
          this.selectionBoundaryRight >
          100 - this.selectionBoundaryLeft
        ) {
          this.selectionBoundaryRight = 100 - this.selectionBoundaryLeft;
          this.draggedThumb.posPercent = this.selectionBoundaryRight;
        }

        // Update selected maximum value in DOM:
        this.selected.to =
          this.min + (100 - this.selectionBoundaryRight) * this.progressPercent;
        this.subElements.to.textContent = this.formatValue(this.selected.to);

        // Update selection in DOM:
        const newRightPosition = this.draggedThumb.posPercent + "%";
        this.draggedThumb.el.style.right = newRightPosition;
        this.subElements.progress.style.right = newRightPosition;
    }

    this.draggedThumb.posAbs = newX;
  };

  _dropThumb = () => {
    // console.log("_dropThumb()");

    document.removeEventListener("pointermove", this._dragThumb);
    document.removeEventListener("pointerup", this._dropThumb);

    if (!this.draggedThumb) return;

    this.draggedThumb = null;
    this.dispatchRangeSelect();
  };

  getSubElements(element = document) {
    const subElementsNodeList = element.querySelectorAll("[data-element]");
    return Array.from(subElementsNodeList).reduce(
      (acc, el) => ({ ...acc, [el.dataset.element]: el }),
      {}
    );
  }

  dispatchRangeSelect(
    target = this.element,
    { from = this.selected.from, to = this.selected.to } = {}
  ) {
    target.dispatchEvent(
      new CustomEvent("range-select", {
        detail: { from, to },
      })
    );
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeListeners();
    this.element = null;
    this.subElements = null;
  }
}

function htmlToElement(html) {
  const div = document.createElement("div");
  div.insertAdjacentHTML("afterbegin", html.trim());
  return div.firstChild;
}
