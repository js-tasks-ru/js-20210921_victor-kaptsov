export default class ColumnChart {
  element;
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
  } = {}) {
    this.getIntermediateHTMLString = this.#chartTemplateGen({
      isLoading: isEmpty(data),
      chartHeight: this.chartHeight,
      labelText: label,
      linkText: "View All",
      linkHref: link,
      value: formatHeading(value),
    });

    const chartColumns = this.#getColumnProps(data)
      .map(this.#chartColumnGen)
      .join("");
    const finalHtmlString = this.getIntermediateHTMLString(chartColumns);

    this.element = htmlToElement(finalHtmlString);
    this.chartBody = this.element.querySelector(
      "." + this.#classNames.chartBody
    );
  }

  update(newData) {
    if (isEmpty(newData)) this._toggleLoader(true);
    else {
      this._toggleLoader(false);
      this.chartBody.innerHTML = this.#getColumnProps(newData)
        .map(this.#chartColumnGen)
        .join("");
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  _toggleLoader(enable) {
    if (enable) this.element.classList.add(this.#classNames.loading);
    else this.element.classList.remove(this.#classNames.loading);
  }

  #chartTemplateGen =
    ({
      isLoading = true,
      chartHeight = 50,
      labelText = "",
      linkText = "",
      linkHref = "",
      value = "",
    }) =>
    (chartColumns) => {
      const elementClasses = isLoading
        ? this.#classNames.element + " " + this.#classNames.loading
        : this.#classNames.element;

      const linkTag = linkHref
        ? `<a href="${linkHref}" class="${
            this.#classNames.link
          }">${linkText}</a>`
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
              ${chartColumns}
            </div>
          </div>
        </div>
      `;
    };

  #chartColumnGen = ({ value, percent }) =>
    `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;

  #getColumnProps = (data) => {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map((item) => ({
      value: String(Math.floor(item * scale)),
      percent: ((item / maxValue) * 100).toFixed(0),
    }));
  };
}

function htmlToElement(html) {
  // const template = document.createElement("template");
  // template.innerHTML = html.trim();
  // return template.content.firstChild;
  const div = document.createElement("div");
  div.insertAdjacentHTML("afterbegin", html.trim());
  return div.firstChild;
}

function isEmpty(data) {
  return data.length === 0;
}
