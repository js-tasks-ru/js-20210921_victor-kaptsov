const classNames = {
  element: "column-chart",
  loading: "column-chart_loading",
  label: "column-chart__title",
  link: "column-chart__link",
  container: "column-chart__container",
  header: "column-chart__header",
  chartBody: "column-chart__chart",
};

export default class ColumnChart {
  element = document.createElement("article");
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = (x) => x,
  } = {}) {
    this.element.classList.add(classNames.element);
    this.element.setAttribute("style", `--chart-height: ${this.chartHeight}`);

    this.labelEl = document.createElement("header");
    this.labelEl.classList.add(classNames.label);

    if (label) {
      const labelText = document.createTextNode(label);
      this.labelEl.append(labelText);
    }

    if (link) {
      const linkEl = document.createElement("a");
      linkEl.textContent = "View All";
      linkEl.href = link;
      linkEl.classList.add(classNames.link);
      this.labelEl.append(linkEl);
    }

    this.element.append(this.labelEl);

    this.chartContainer = document.createElement("section");
    this.chartContainer.classList.add(classNames.container);

    this.chartHeader = document.createElement("header");
    this.chartHeader.classList.add(classNames.header);
    this.chartHeader.dataset.element = "header";
    this.chartHeader.textContent = formatHeading(value);
    this.chartContainer.append(this.chartHeader);

    this.chartBody = document.createElement("div");
    this.chartBody.classList.add(classNames.chartBody);
    this.chartBody.dataset.element = "body";
    this.chartContainer.append(this.chartBody);

    if (data.length > 0)
      fillWithChartColumns(this.chartBody, data, this.chartHeight);
    else this.element.classList.add(classNames.loading);

    this.element.append(this.chartContainer);
  }

  update(newData) {
    if (newData.length > 0) {
      this.element.classList.remove(classNames.loading);
    }
    this.chartBody.innerHTML = "";
    fillWithChartColumns(this.chartBody, newData, this.chartHeight);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

function getColumnProps(height, data) {
  const maxValue = Math.max(...data);
  const scale = height / maxValue;

  return data.map((item) => ({
    value: String(Math.floor(item * scale)),
    percent: ((item / maxValue) * 100).toFixed(0),
  }));
}

function generateColumn({ value, percent }) {
  const chartLine = document.createElement("div");
  chartLine.style.setProperty("--value", value);
  chartLine.dataset.tooltip = percent + "%";
  return chartLine;
}

function fillWithChartColumns(container, data, height) {
  container.append(...getColumnProps(height, data).map(generateColumn));
}
