import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements;
  sortedData = [];
  loadedDataRange = { start: 0, end: 0 };
  isLoading;

  orderMultipliers = { asc: 1, desc: -1 };
  cssClassModifiers = {
    loading: 'sortable-table_loading',
    empty: 'sortable-table_empty',
  };

  constructor (
    headerConfig,
    {
      url = '',
      data = [],
      isSortLocally,
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: 'asc'
      },
      itemsOnPage = 0,
    } = {},
  ) {
    this.url = url;
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;

    this.sorted = sorted;
    this.itemsOnPage = itemsOnPage
    this.isSortLocally = isSortLocally || (!!data.length && !url);

    this.render();
  }

  get template () {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">

        ${this.getTableHeader(this.headerConfig)}

        ${this.getTableBody(this.sortedData)}

        ${this.getLoader()}

        ${this.getEmptyPlaceholder()}
      </div>
    </div>
    `;
  }

  async render () {
    this.element = htmlToElement(this.template);
    this.subElements = this.getSubElements(this.element);
    this.addListeners();

    this.sortedData = await this.sort(this.sorted.id, this.sorted.order);
    this.updateTable(this.sorted.id, this.sorted.order);
  }

  getSubElements (element = document) {
    const subElementsNodeList = element.querySelectorAll('[data-element]');
    return Array.from(subElementsNodeList).reduce(
      (acc, el) => ({ ...acc, [el.dataset.element]: el }),
      {}
    );
  }

  addListeners () {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    if (this.itemsOnPage > 0) window.addEventListener('scroll', this.onWindowScroll);
  }

  async sort (columnId, order) {
    let sortedData;
    if (this.isSortLocally) {
      this.sortedData = [...this.data];
      sortedData = this.sortOnClient(columnId, order);
    } else {
      sortedData = await this.sortOnServer(columnId, order);
    }

    this.sorted.id = columnId;
    this.sorted.order = order;

    return sortedData;
  }

  sortOnClient (columnId, order) {
    const shallowDatasetClone = [...this.sortedData];

    const sortColumn = this.headerConfig.find((col) => col.id === columnId);
    if (!sortColumn) {
      console.warn('Unknown sort field id!');
      return;
    }

    if (!this.orderMultipliers[order]) {
      console.warn('Unexpected order! Using default `ascending`!');
      order = 'asc';
    }

    switch (sortColumn.sortType) {
    case 'string':
      shallowDatasetClone.sort(
        (productA, productB) =>
          this.orderMultipliers[order] *
                productA[columnId].localeCompare(productB[columnId], ['ru', 'en'], {
                  caseFirst: 'upper'
                })
      );
      break;
    case 'number':
      shallowDatasetClone.sort(
        (productA, productB) =>
          this.orderMultipliers[order] *
                (productA[columnId] - productB[columnId])
      );
    default:
    }

    return shallowDatasetClone;
  }

  async sortOnServer (id, order) {
    let sortedServerData
    if (this.itemsOnPage > 0) {
      console.log('here')
      const loadTo = this.loadedDataRange.start + this.itemsOnPage
      console.log('loadTo:', loadTo)
      sortedServerData = await this.load(id, order, this.loadedDataRange.start, loadTo);
    } else {
      sortedServerData = await this.load(id, order);
    }
    return sortedServerData;
  }

  async load(sortBy, order, start = null, end = null) {
    if (!this.url) {
      this.hideLoading();
      return this.data;
    }

    const loadUrl = new URL(this.url, BACKEND_URL);
    loadUrl.searchParams.set('_sort', sortBy);
    loadUrl.searchParams.set('_order', order);
    if (start !== null && start >= 0) {
      loadUrl.searchParams.set('_start', start);
      this.loadedDataRange.start = start;
    }
    if (start !== null && end !== null &&
      end >= 0 && end >= start) {
      loadUrl.searchParams.set('_end', end);
      this.loadedDataRange.end = end;
    }
    this.showLoading();
    const sortedServerData = await fetchJson(loadUrl);
    this.hideLoading();
    return sortedServerData;
  }

  updateTable (columnId, order) {
    this.updateTableHeader(columnId, order)

    if (!this.sortedData.length) {
      this.showEmptyPlaceholder();
      this.hideLoading();
      return;
    }

    this.hideEmptyPlaceholder();

    const sortedTableBody = this.getTableBody(this.sortedData);
    this.subElements.body.innerHTML = sortedTableBody;
  }

  updateTableHeader (columnId, order) {
    if (!columnId || !order) return

    const columnHeaderCell = this.subElements.header.querySelector(
      `[data-id=${columnId}]`
    );
    if (!columnHeaderCell.contains(this.subElements.arrow)) {
      columnHeaderCell.append(this.subElements.arrow);
    }
    columnHeaderCell.dataset.order = order;
  }

  onHeaderClick = async (evt) => {
    const sortCell = evt.target.closest('[data-sortable]');

    if (sortCell) {
      if (sortCell.dataset.sortable === 'false') { return; }
      if (!evt.currentTarget.contains(sortCell)) { return; }

      const newOrder = this.reverseSortOrder(sortCell.dataset.order);

      this.sortedData = await this.sort(sortCell.dataset.id, newOrder);
      this.updateTable(sortCell.dataset.id, newOrder);
    } else {
      console.warn('No Sort Cell found!');
    }
  }

  reverseSortOrder (order) {
    return { asc: 'desc', desc: 'asc' }[order];
  }

  onWindowScroll = async (evt) => {
    const shiftSizePx = 150;
    const windowHeight = document.documentElement.clientHeight;

    const atTableBottom = document.documentElement.getBoundingClientRect().bottom < windowHeight + shiftSizePx;

    if (!atTableBottom || this.isLoading) return;

    this.isLoading = true
    await this.onScrollToBottom();
    this.isLoading = false
  }

  async onScrollToBottom () {
    const loadTo = this.loadedDataRange.end + this.itemsOnPage
    const nextDataChunk = await this.load(this.sorted.id, this.sorted.order, this.loadedDataRange.end, loadTo)
    this.sortedData = this.sortedData.concat(nextDataChunk)
    this.updateTable()
  }

  showLoading () {
    this.element.firstElementChild.classList.add(this.cssClassModifiers.loading);
  }

  hideLoading () {
    this.element.firstElementChild.classList.remove(this.cssClassModifiers.loading);
  }

  showEmptyPlaceholder () {
    this.element.firstElementChild.classList.add(this.cssClassModifiers.empty);
  }

  hideEmptyPlaceholder () {
    this.element.firstElementChild.classList.remove(this.cssClassModifiers.empty);
  }

  getTableHeader (dataset) {
    if (!dataset.length) return '';

    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${dataset.map((col) => this.getHeaderRow(col)).join('')}
      </div>
    `;
  }

  getHeaderRow (col) {
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

  getSortArrow (isSortable) {
    return isSortable
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
           <span class="sort-arrow"></span>
         </span>`
      : '';
  }

  getTableBody (dataset = []) {
    return dataset.length
      ? `
      <div data-element="body" class="sortable-table__body">
        ${dataset.map((item) => this.getTableRow(item)).join('')}
      </div>`
      : `
      <div data-element="body" class="sortable-table__body"></div>`;
  }

  getTableRow (item) {
    return `
    <a href="/products/${item.id}" class="sortable-table__row">
      ${this.getTableCells(item)}
    </a>
    `;
  }

  getTableCells (item) {
    return this.headerConfig
      .map(({ id, template }) =>
        template
          ? template(item.images)
          : `<div class="sortable-table__cell">${item[id]}</div>`
      )
      .join('');
  }

  getLoader () {
    return `
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>`;
  }

  getEmptyPlaceholder () {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>`;
  }

  removeListeners () {
    // NOTE: can't pass last Unit Test without this check!!!
    if (this.subElements) {
      this.subElements.header.removeEventListener(
        'pointerdown',
        this.onHeaderClick
      );
    }
  }

  remove () {
    if (this.element) { this.element.remove(); }
  }

  destroy () {
    this.remove();
    this.removeListeners();
    this.element = null;
    this.subElements = null;
  }
}

function htmlToElement (html) {
  const div = document.createElement('div');
  div.insertAdjacentHTML('afterbegin', html.trim());
  return div.firstChild;
}
