import {
  closest,
  createElement,
  getEl,
  getParsedDate,
  removeClass,
} from "./utils";

import "./dateselectorNav.scss";
import consts from "./consts";

export default class DateselectorNav {
  constructor({ ds, opts }) {
    this.ds = ds;
    this.opts = opts;

    this.init();
  }

  init() {
    this._createElement();
    this._buildBaseHtml();
    this._defineDOM();

    this.render();

    this.handleNavStatus();
    this._bindEvents();
    this._bindDateselectorEvents();
  }

  _defineDOM() {
    this.$title = getEl(".air-dateselector-nav--title", this.$el);
    this.$prev = getEl('[data-action="prev"]', this.$el);
    this.$next = getEl('[data-action="next"]', this.$el);
  }

  _bindEvents() {
    this.$el.addEventListener("click", this.onClickNav);
  }

  _bindDateselectorEvents() {
    this.ds.on(consts.eventChangeViewDate, this.onChangeViewDate);

    if (this.isNavIsFunction) {
      // Wait till time is added to date
      this.ds.on(consts.eventChangeSelectedDate, this.renderDelay);
    }
  }

  destroy() {
    this.ds.off(consts.eventChangeViewDate, this.onChangeViewDate);

    if (this.isNavIsFunction) {
      this.ds.off(consts.eventChangeSelectedDate, this.renderDelay);
    }
  }

  _createElement() {
    this.$el = createElement({
      tagName: "nav",
      className: "air-dateselector-nav",
    });
  }

  _getTitle() {
    let { ds, opts } = this;
    let template = opts.navTitles.days;

    if (typeof template === "function") {
      return template(ds);
    }

    return ds.formatDate(ds.viewDate, template);
  }

  handleNavStatus() {
    let { minDate, maxDate } = this.ds;
    if (!(minDate || maxDate)) return;

    let { year, month } = this.ds.parsedViewDate;
    let minDateParsed = minDate ? getParsedDate(minDate) : false;
    let maxDateParsed = maxDate ? getParsedDate(maxDate) : false;

    if (minDate && minDateParsed.month >= month && minDateParsed.year >= year) {
      this._disableNav("prev");
    }

    if (maxDate && maxDateParsed.month <= month && maxDateParsed.year <= year) {
      this._disableNav("next");
    }
  }

  _disableNav(actionName) {
    getEl('[data-action="' + actionName + '"]', this.$el).classList.add(
      "-disabled-"
    );
  }

  _resetNavStatus() {
    removeClass(
      this.$el.querySelectorAll(".air-dateselector-nav--action"),
      "-disabled-"
    );
  }

  onClickNav = (e) => {
    let $item = closest(e.target, ".air-dateselector-nav--action");
    if (!$item) return;

    let actionName = $item.dataset.action;

    this.ds[actionName]();
  };

  onChangeViewDate = () => {
    this.render();
    this._resetNavStatus();
    this.handleNavStatus();
  };

  _buildBaseHtml() {
    let { prevHtml, nextHtml } = this.opts;

    this.$el.innerHTML =
      "" +
      `<div class="air-dateselector-nav--action" data-action="prev">${prevHtml}</div>` +
      '<div class="air-dateselector-nav--title"></div>' +
      `<div class="air-dateselector-nav--action" data-action="next">${nextHtml}</div>`;
  }

  get isNavIsFunction() {
    let { navTitles } = this.opts;

    return Object.keys(navTitles).find((view) => {
      return typeof navTitles[view] === "function";
    });
  }

  update = () => {
    let { prevHtml, nextHtml } = this.opts;

    this.$prev.innerHTML = prevHtml;
    this.$next.innerHTML = nextHtml;

    this._resetNavStatus();
    this.render();
    this.handleNavStatus();
  };

  renderDelay = () => {
    setTimeout(this.render);
  };

  render = () => {
    this.$title.innerHTML = this._getTitle();
  };
}
