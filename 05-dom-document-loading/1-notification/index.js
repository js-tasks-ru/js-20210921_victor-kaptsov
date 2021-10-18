export default class NotificationMessage {
  static activeNotification;

  element;
  timerId;

  #NOTIFICATION_TYPES = { SUCCESS: "success", ERROR: "error" };

  constructor(message, { duration = 5000, type = "success" } = {}) {
    this.message = message;
    this.duration = duration;
    const notificationType = this._getNotificationType(type);
    if (notificationType) {
      this.type = type;
    } else {
      console.warn("Unknown notification type! Changing to Error type");
      this.type = this.#NOTIFICATION_TYPES.ERROR;
    }

    this.render();
  }

  get template() {
    const liveTime = this.duration / 1000;

    return `
      <div class="notification ${this.type}" style="--value:${liveTime}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">${this.message}</div>
        </div>
      </div>
    `;
  }

  render() {
    this.element = htmlToElement(this.template);
  }

  show(targetEl = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }
    targetEl.append(this.element);
    this.timerId = setTimeout(() => this.remove(), this.duration);

    NotificationMessage.activeNotification = this;
  }

  remove() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;

    NotificationMessage.activeNotification = null;
  }

  _getNotificationType(searchValue) {
    return Object.entries(this.#NOTIFICATION_TYPES).find(([key, value]) =>
      searchValue === value ? key : null
    );
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
