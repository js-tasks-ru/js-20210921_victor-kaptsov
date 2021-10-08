export default class NotificationMessage {
  static isShown;
  static activeNotification;

  element;
  timer;

  #NOTIFICATION_TYPES = { SUCCESS: "success", ERROR: "error" };

  constructor(message, { duration = 5000, type = "success" } = {}) {
    this.message = message;
    this.duration = duration;
    const notificationType = this._getNotificationType(type);
    console.log("notificationType:", notificationType);
    if (notificationType) {
      this.type = type;
    } else {
      console.warn("Unknown notification type!");
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

  show(targetEl) {
    if (NotificationMessage.isShown) {
      NotificationMessage.activeNotification.hide();
    }
    if (targetEl) targetEl.append(this.element);
    else document.body.append(this.element);
    this.timer = setTimeout(() => this.hide(), this.duration);

    NotificationMessage.activeNotification = this;
    NotificationMessage.isShown = true;
  }

  hide() {
    this.destroy();
    NotificationMessage.activeNotification = null;
    NotificationMessage.isShown = false;
  }

  destroy() {
    this.remove();
    this.element = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  remove() {
    if (this.element) this.element.remove();
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
