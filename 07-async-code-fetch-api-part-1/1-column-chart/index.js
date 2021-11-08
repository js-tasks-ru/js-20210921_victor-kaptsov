import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  element;
  subElements;
  chartHeight = 50;

  #classNames = {
    element: "column-chart",
    loading: "column-chart_loading",
    label: "column-chart__title",
    link: "column-chart__link",
    container: "column-chart__container",
    header: "column-chart__header",
    chartBody: "column-chart__chart",
  };

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = (x) => x,
    url = "",
    range = {
      from: new Date(),
      to: new Date(),
    },
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);
    this.url = url;
    this.range = range;

    this.render();
    if (this.url) this.update(range.from, range.to);
  }

  render() {
    const chartTemplateStr = this.chartTemplateGenerator({
      isLoading: isEmpty(this.data),
      chartHeight: this.chartHeight,
      labelText: this.label,
      linkText: "View All",
      linkHref: this.link,
      value: this.value,
    });

    this.element = htmlToElement(chartTemplateStr);
    this.subElements = this.getSubElements(this.element);
  }

  async update(from, to) {
    const updateUrl = new URL(this.url, BACKEND_URL);
    updateUrl.searchParams.append("to", to.toISOString());
    updateUrl.searchParams.append("from", from.toISOString());

    const newData = await fetchJson(updateUrl);

    const dataArr = Object.entries(newData);
    this.data = dataArr;

    if (isEmpty(dataArr)) this._toggleLoader(true);
    else {
      this._toggleLoader(false);
      this.subElements.body.innerHTML = this.chartBodyGenerator(dataArr);
    }

    return newData;
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  chartTemplateGenerator = ({
    isLoading = true,
    chartHeight = 50,
    labelText = "",
    linkText = "",
    linkHref = "",
    value = "",
  }) => {
    const elementClasses = isLoading
      ? this.#classNames.element + " " + this.#classNames.loading
      : this.#classNames.element;

    const linkTag = linkHref
      ? `<a href="${linkHref}" class="${this.#classNames.link}">${linkText}</a>`
      : ``;

    return `
        <div class="${elementClasses}" style="--chart-height: ${chartHeight}">
          <div class="${this.#classNames.label}">
            ${labelText}
            ${linkTag}
          </div>
          <div class="${this.#classNames.container}">
            <div data-element="header" class="${
              this.#classNames.header
            }">${value}</div>
            <div data-element="body" class="${this.#classNames.chartBody}">
              ${this.chartBodyGenerator(this.data)}
            </div>
          </div>
        </div>
      `;
  };

  chartBodyGenerator = (dataArr) =>
    this.getColumnProps(dataArr).map(this.chartColumnGenerator).join("");

  getColumnProps = (dataArr) => {
    const values = dataArr.map((x) => x[1]);
    const maxValue = Math.max(...values);
    const scale = this.chartHeight / maxValue;

    return dataArr.map(([date, item]) => ({
      value: String(Math.floor(item * scale)),
      percent: ((item / maxValue) * 100).toFixed(0),
      date: date,
    }));
  };

  chartColumnGenerator = ({ value, percent, date }) =>
    `<div style="--value: ${value}" data-tooltip="${date}\n${percent}%"></div>`;

  getSubElements(element = document) {
    const subElementsNodeList = element.querySelectorAll("[data-element]");
    return Array.from(subElementsNodeList).reduce(
      (acc, el) => ({ ...acc, [el.dataset.element]: el }),
      {}
    );
  }

  _toggleLoader(enable) {
    if (enable) this.element.classList.add(this.#classNames.loading);
    else this.element.classList.remove(this.#classNames.loading);
  }
}

// NOTE: next functions should be in separate utilities file:

function htmlToElement(html) {
  const div = document.createElement("div");
  div.insertAdjacentHTML("afterbegin", html.trim());
  return div.firstChild;
}

function isEmpty(data) {
  return data.length === 0;
}
