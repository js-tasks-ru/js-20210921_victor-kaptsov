export default class SortableTable {
  element;
  subElements;

  orderMultipliers = { asc: 1, desc: -1 };

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;

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
          ${this.getTableBody()}
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
  }

  sort(field, order) {
    const sortColumn = this.headerConfig.find((col) => col.id === field);
    if (!sortColumn) {
      console.warn("Unknown sort field!");
      return;
    }

    if (!this.orderMultipliers[order]) {
      console.warn("Unexpected order! Using default `ascending`!");
      order = "asc";
    }

    switch (sortColumn.sortType) {
      case "string":
        this.data.sort(
          (productA, productB) =>
            this.orderMultipliers[order] *
            productA[field].localeCompare(productB[field], ["ru", "en"], {
              caseFirst: "upper",
            })
        );
        break;
      case "number":
        this.data.sort(
          (productA, productB) =>
            this.orderMultipliers[order] * (productA[field] - productB[field])
        );
      default:
    }

    const sortedTableBody = this.getTableBody();
    this.subElements.body.innerHTML = sortedTableBody;
  }

  getSubElements(element = document) {
    const subElementsNodeList = element.querySelectorAll("[data-element]");
    return Array.from(subElementsNodeList).reduce(
      (acc, el) => ({ ...acc, [el.dataset.element]: el }),
      {}
    );
  }

  getTableHeader() {
    return this.headerConfig.map((col) => this.getHeaderRow(col)).join("");
  }

  getHeaderRow(col) {
    return `
      <div
        class="sortable-table__cell"
        data-id="${col.id}"
        data-sortable="${col.sortable}">
         <span>${col.title}</span>
         ${this.getSortArrow(col.sortable)}
       </div>`;
  }

  getSortArrow(isSortable) {
    return isSortable
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
           <span class="sort-arrow"></span>
         </span>`
      : "";
  }

  getTableBody() {
    return this.data.map((item) => this.getTableRow(item)).join("");
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

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
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
