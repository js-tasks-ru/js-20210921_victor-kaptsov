export default class SortableTable {
  element;
  subElements;

  orderMultipliers = { asc: 1, desc: -1 };

  constructor(
    headerConfig,
    { data = [], sorted = {} } = {},
    isSortLocally = true
  ) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.sorted = sorted;

    this.isSortLocally = isSortLocally;
    this.onHeaderClick = this.onHeaderClick.bind(this);

    this.sortedData = this.sort(this.data, sorted.id, sorted.order);

    this.render();
  }

  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">

        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getTableHeader()}
        </div>

        <div data-element="body" class="sortable-table__body">
          ${this.getTableBody(this.sortedData)}
        </div>

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>

      </div>
    </div>
    `;
  }

  render() {
    this.element = htmlToElement(this.template);
    this.subElements = this.getSubElements(this.element);
    this.addListeners();
  }

  update(columnId, order) {
    const columnHeaderCell = this.subElements.header.querySelector(
      `[data-id=${columnId}]`
    );
    if (!columnHeaderCell.contains(this.subElements.arrow)) {
      columnHeaderCell.append(this.subElements.arrow);
    }
    columnHeaderCell.dataset.order = order;

    const sortedTableBody = this.getTableBody(this.sortedData);
    this.subElements.body.innerHTML = sortedTableBody;
  }

  sort(dataset, columnId, order) {
    let sortedData;

    if (this.isSortLocally) {
      sortedData = this.sortOnClient(dataset, columnId, order);
    } else {
      sortedData = this.sortOnServer();
    }

    this.sorted.id = columnId;
    this.sorted.order = order;

    return sortedData;
  }

  sortOnClient(dataset, columnId, order) {
    let shallowDatasetClone = [...dataset];

    const sortColumn = this.headerConfig.find((col) => col.id === columnId);
    if (!sortColumn) {
      console.warn("Unknown sort field id!");
      return;
    }

    if (!this.orderMultipliers[order]) {
      console.warn("Unexpected order! Using default `ascending`!");
      order = "asc";
    }

    switch (sortColumn.sortType) {
      case "string":
        shallowDatasetClone.sort(
          (productA, productB) =>
            this.orderMultipliers[order] *
            productA[columnId].localeCompare(productB[columnId], ["ru", "en"], {
              caseFirst: "upper",
            })
        );
        break;
      case "number":
        shallowDatasetClone.sort(
          (productA, productB) =>
            this.orderMultipliers[order] *
            (productA[columnId] - productB[columnId])
        );
      default:
    }

    return shallowDatasetClone;
  }

  sortOnServer() {
    // TODO: should be implemented later
    console.error("sortOnServer() is not implemented yet!");
  }

  addListeners() {
    // this.subElements.header.addEventListener("click", this.onHeaderClick);
    this.subElements.header.addEventListener("pointerdown", this.onHeaderClick);
  }

  removeListeners() {
    // NOTE: can't pass last Unit Test without this check!!!
    if (this.subElements) {
      this.subElements.header.removeEventListener(
        "pointerdown",
        this.onHeaderClick
      );
    }
  }

  onHeaderClick(evt) {
    const sortCell = evt.target.closest("[data-sortable]");

    if (sortCell) {
      if (sortCell.dataset.sortable === "false") return;

      const newOrder = this.reverseSortOrder(sortCell.dataset.order);

      this.sortedData = this.sort(
        this.sortedData,
        sortCell.dataset.id,
        newOrder
      );

      this.update(sortCell.dataset.id, newOrder);
    } else {
      console.warn("No Sort Cell found!");
    }
  }

  reverseSortOrder(order) {
    return { asc: "desc", desc: "asc" }[order];
  }

  getTableHeader() {
    return this.headerConfig.map((col) => this.getHeaderRow(col)).join("");
  }

  getHeaderRow(col) {
    return `
      <div
        class="sortable-table__cell"
        data-id="${col.id}"
        data-sortable="${col.sortable}"
        data-order="${this.sorted.order}"
        >
         <span>${col.title}</span>
         ${this.getSortArrow(col.id === this.sorted.id)}
       </div>`;
  }

  getSortArrow(isSortable) {
    return isSortable
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
           <span class="sort-arrow"></span>
         </span>`
      : "";
  }

  getTableBody(dataset) {
    return dataset.map((item) => this.getTableRow(item)).join("");
  }

  getTableRow(item) {
    return `
    <a href="/products/${item.id}" class="sortable-table__row">
      ${this.getTableCells(item)}
    </a>
    `;
  }

  getTableCells(item) {
    return this.headerConfig
      .map(({ id, template }) =>
        template
          ? template(item.images)
          : `<div class="sortable-table__cell">${item[id]}</div>`
      )
      .join("");
  }

  getSubElements(element = document) {
    const subElementsNodeList = element.querySelectorAll("[data-element]");
    return Array.from(subElementsNodeList).reduce(
      (acc, el) => ({ ...acc, [el.dataset.element]: el }),
      {}
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
  // const template = document.createElement("template");
  // template.innerHTML = html.trim();
  // return template.content.firstChild;
  const div = document.createElement("div");
  div.insertAdjacentHTML("afterbegin", html.trim());
  return div.firstChild;
}
