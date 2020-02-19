/*!
 * vue-date-picker-with-range v1.0.0
 * (c) Joshua Cave
 * Released under the ISC License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var parseTime = _interopDefault(require('parsetime'));
var styleInject = _interopDefault(require('../node_modules/style-inject/dist/style-inject.es.js'));
var __vue_normalize__ = _interopDefault(require('vue-runtime-helpers/dist/normalize-component.mjs'));

//
var month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function rd_getDOY(now) {
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return day;
}

function rd_fmt(date) {
  var day = date.getDate();
  var month_index = date.getMonth();
  var year = date.getFullYear();
  return "" + day + " " + month_names[month_index] + " " + year;
}

function rd_fmttime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var amPm = 'AM';

  if (hours > 11) {
    amPm = 'PM';
  }

  if (hours === 0) {
    hours = 12;
  }

  if (hours > 12) {
    hours = hours - 12;
  }

  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  return hours + ':' + minutes + ' ' + amPm;
}

var script = {
  // COMPONENT
  // ______________________________________
  name: 'RangeDatePicker',
  props: {
    type: {
      type: String,
      required: true,
      validator: function validator(value) {
        // The value must match one of these strings
        return ['date', 'datetime', 'rangedate'].indexOf(value) !== -1;
      }
    },
    cssPrefix: {
      type: String,
      "default": ''
    },
    startDate: Date,
    endDate: Date,
    from: Date,
    to: Date,
    isRange: Boolean
  },
  components: {},
  computed: {
    isRangePicker: function isRangePicker() {
      return this.type.indexOf('range') >= 0;
    },
    fmttedRangeDate: function fmttedRangeDate() {
      var fmt = '';

      if (this.innerFrom) {
        fmt += rd_fmt(this.innerFrom);
      }

      if (this.innerTo) {
        fmt += ' - ' + rd_fmt(this.innerTo);
      }

      return fmt;
    },
    selectedDate: function selectedDate() {
      return new Date(this.selectedYear, this.selectedMonth, 1);
    },
    selectedDateDayOfYear: function selectedDateDayOfYear() {
      return rd_getDOY(this.selectedDate);
    },
    yearRange: function yearRange() {
      var start = new Date().getFullYear();
      var end = new Date(new Date().getFullYear() + 10);

      if (this.startDate) {
        start = new Date(this.startDate);
      }

      if (this.endDate) {
        end = new Date(this.endDate);
      }

      var years = [];

      while (start < end) {
        years.push(start);
        start++;
      }

      return years;
    },
    dayRows: function dayRows() {
      // THIS always starts on sunday.. so if your month starts on a monday then sunday will be a 0 array item
      var days = [];
      var i = 0;
      var selectedDay = this.selectedDate.getDay();
      var monthEnd = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0).getDate(); //padd start of month

      while (i < selectedDay && i < 32) {
        days.push(0);
        i++;
      }

      i = 1; // one based cause dates don't start at 0

      while (i <= monthEnd && i < 32) {
        days.push(i);
        i++;
      }

      var dayRows = [];
      var dayRow = [];

      for (var _i = 0; _i < days.length; _i++) {
        if (_i % 7 == 0 && _i !== 0) {
          dayRows.push(dayRow);
          dayRow = [];
        }

        dayRow.push({
          dayNum: days[_i],
          date: new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), _i - selectedDay + 1) //+1 for 0 based index with offset of padded days

        });
      } //padd end of month


      var padEnd = 7 - dayRow.length;
      i = 1;

      while (i <= padEnd && i < 32) {
        dayRow.push({
          dayNum: 0,
          date: new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, i)
        });
        i++;
      }

      dayRows.push(dayRow);
      return dayRows;
    },
    pfx: function pfx() {
      return this.cssPrefix;
    },
    hasFrom: function hasFrom() {
      return this.innerFrom !== null;
    },
    hasTo: function hasTo() {
      return this.innerTo !== null;
    }
  },
  methods: {
    parseDate: function parseDate(ev) {
      var val = ev.target.value;
      var parsed = parseTime(val);

      if (parsed.absolute) {
        this.setFrom(new Date(parsed.absolute));
      }

      if (val.indexOf('-') > 0) {
        var toVal = val.split('-');

        if (toVal.length > 0) {
          val = toVal[1];
        }

        var _parsed = parseTime(val);

        if (_parsed.absolute) {
          this.setTo(new Date(_parsed.absolute));
        }
      }

      this.closePicker();
    },
    dateClicked: function dateClicked(day) {
      this.hoverDate = null;

      if (this.isRangePicker) {
        if (this.hasTo) {
          this.setFrom(day.date);
          this.setTo(null);
          return;
        }

        if (this.hasFrom && this.innerFrom.getTime() < day.date.getTime()) {
          this.setTo(day.date);
          this.isPickerActive = false;
          this.$emit('input', {
            from: this.innerFrom,
            to: this.innerTo
          });
          return;
        }
      }

      this.setFrom(day.date);

      if (this.isRangePicker) {
        this.$emit('input', {
          from: this.innerFrom,
          to: this.innerTo
        });
      } else {
        this.$emit('input', this.innerFrom);

        if (this.type !== 'datetime') {
          this.isPickerActive = false;
        }
      }
    },
    updateStartDate: function updateStartDate(day) {
      this.startDate = day.date;
    },
    updateHoverDate: function updateHoverDate(day) {
      if (!this.isRangePicker) {
        return;
      }

      if (this.innerFrom !== null && this.innerTo === null) {
        this.hoverDate = day.date;
      }
    },
    closePicker: function closePicker() {
      this.isPickerActive = false;
    },
    togglePicker: function togglePicker() {
      this.isPickerActive = !this.isPickerActive;
    },
    setFrom: function setFrom(val) {
      this.innerFrom = val;

      if (this.type === 'datetime') {
        this.setTimeOnFrom();
      }

      this.$emit('from-changed', this.innerFrom);
      this.formatField();
    },
    setTimeOnFrom: function setTimeOnFrom() {
      var dt = this.innerFrom ? new Date(this.innerFrom) : new Date();
      var hours = this.selectedHour;

      if (this.selectedAMPM === 0 && hours === 12) {
        hours = 0;
      } else if (this.selectedAMPM === 12 && hours < 12) {
        hours = this.selectedHour + this.selectedAMPM;
      }

      dt.setHours(hours);
      dt.setMinutes(this.selectedMinute);
      this.innerFrom = dt;
    },
    setTo: function setTo(val) {
      this.innerTo = val;
      this.$emit('to-changed', this.innerTo);
      this.formatField();
    },
    formatField: function formatField() {
      var result = '';

      if (this.innerFrom) {
        result = rd_fmt(this.innerFrom);

        if (this.type.indexOf('time') > -1) {
          result += ' ' + rd_fmttime(this.innerFrom);
        }
      }

      if (this.isRangePicker) {
        result += ' - ';
      }

      if (this.innerTo) {
        result += rd_fmt(this.innerTo);

        if (this.type.indexOf('time') > -1) {
          result += ' ' + rd_fmttime(this.innerTo);
        }
      }

      this.$refs.inp.value = result;
    }
  },
  watch: {},
  data: function data() {
    return {
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      selectedHour: 1,
      selectedMinute: 0,
      selectedAMPM: 0,
      start: null,
      hoverDate: null,
      isPickerActive: false,
      innerFrom: null,
      innerTo: null
    };
  },
  // LIFECYCLE METHODS
  // ______________________________________
  beforeCreate: function beforeCreate() {},
  created: function created() {
    if (Object.hasOwnProperty(this.value, 'to')) {
      this.innerFrom = this.value.from;
      this.innerTo = this.value.to;
    }

    if (this.from || this.value) {
      this.innerFrom = this.from || this.value;
    }

    if (this.to) {
      this.innerTo = this.to;
    }
  },
  beforeMount: function beforeMount() {},
  mounted: function mounted() {},
  beforeUpdate: function beforeUpdate() {},
  updated: function updated() {},
  beforeDestroy: function beforeDestroy() {},
  destroyed: function destroyed() {}
};

var css = ".dp-range-date .dp-click-overlay{position:fixed;background:rgba(0,0,0,.2);top:0;left:0;bottom:0;right:0;z-index:1}.dp-range-date{position:relative;width:100%}.dp-range-date .dp-input{position:relative;width:100%}.dp-range-date .dp-picker{background:#fff;position:absolute;margin-top:.5rem;margin-left:.5rem;padding:.5rem;z-index:2}.dp-range-date .dp-month-year{display:flex}.dp-range-date .dp-month-year .dp-month-year-spacer{display:block;width:.5rem}.dp-range-date .dp-days .dp-day-row{display:flex;flex-direction:row;justify-content:space-between}.dp-range-date .dp-days .dp-day-row .dp-day{cursor:pointer;width:14.25%;text-align:center;padding:.25rem .5rem;margin-left:-1px}.dp-range-date .dp-days .dp-day-row .dp-day.is-diff-month{color:grey}.dp-range-date .dp-days .dp-day-row .dp-day.is-hovered,.dp-range-date .dp-days .dp-day-row .dp-day:hover{background:red}.dp-range-date .dp-days .dp-day-row .dp-day.is-active-one{background:purple}.dp-range-date .dp-days .dp-day-row .dp-day.is-active-two{background:orange}.dp-range-date .dp-days .dp-day-row .dp-day.is-active-between{background:#ff0}.dp-range-date .dp-days .dp-day-row .dp-day.dp-day-text{font-size:.7rem;color:grey;text-transform:uppercase;background:#fff!important}";
styleInject(css);

/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "dp-range-date override",
    "class": {
      'is-range': _vm.isRangePicker
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.isPickerActive,
      expression: "isPickerActive"
    }],
    staticClass: "dp-click-overlay",
    on: {
      "click": _vm.closePicker
    }
  }), _vm._v(" "), _c('input', {
    ref: "inp",
    staticClass: "dp-input",
    on: {
      "blur": _vm.parseDate
    }
  }), _vm._v(" "), _vm._t("buttons", [_c('button', {
    staticClass: "dp-open-button button is-primary",
    on: {
      "click": _vm.togglePicker
    }
  }, [_c('i', {
    staticClass: "far fa-calendar"
  })])]), _vm._v(" "), _c('transition', [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.isPickerActive,
      expression: "isPickerActive"
    }],
    staticClass: "dp-picker"
  }, [_c('div', {
    staticClass: "dp-month-year field has-addons"
  }, [_c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedMonth,
      expression: "selectedMonth"
    }],
    on: {
      "change": function change($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedMonth = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }
    }
  }, [_c('option', {
    domProps: {
      "value": 0
    }
  }, [_vm._v("Jan")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 1
    }
  }, [_vm._v("Feb")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 2
    }
  }, [_vm._v("Mar")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 3
    }
  }, [_vm._v("Apr")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 4
    }
  }, [_vm._v("May")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 5
    }
  }, [_vm._v("Jun")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 6
    }
  }, [_vm._v("Jul")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 7
    }
  }, [_vm._v("Aug")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 8
    }
  }, [_vm._v("Sept")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 9
    }
  }, [_vm._v("Oct")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 10
    }
  }, [_vm._v("Nov")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 11
    }
  }, [_vm._v("Dec")])])])]), _vm._v(" "), _c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedYear,
      expression: "selectedYear"
    }],
    on: {
      "change": function change($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedYear = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }
    }
  }, _vm._l(_vm.yearRange, function (year, index) {
    return _c('option', {
      key: index,
      domProps: {
        "value": year
      }
    }, [_vm._v(_vm._s(year))]);
  }), 0)])])]), _vm._v(" "), _c('div', {
    staticClass: "dp-days"
  }, [_c('div', {
    staticClass: "dp-day-row dp-day-header"
  }, _vm._l(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], function (dayText, index) {
    return _c('div', {
      key: index,
      staticClass: "dp-day dp-day-text"
    }, [_vm._v("\n            " + _vm._s(dayText) + "\n          ")]);
  }), 0), _vm._v(" "), _vm._l(_vm.dayRows, function (dayrow, index) {
    return _c('div', {
      key: index,
      staticClass: "dp-day-row"
    }, _vm._l(dayrow, function (day, index) {
      return _c('div', {
        key: index,
        staticClass: "dp-day",
        "class": {
          'is-diff-month': day.date.getMonth() !== _vm.selectedMonth,
          'is-hovered': _vm.hoverDate != null && _vm.innerFrom != null && day.date.getTime() > _vm.innerFrom && day.date.getTime() < _vm.hoverDate,
          'is-active-one': _vm.innerFrom != null && day.date.getTime() === _vm.innerFrom.getTime(),
          'is-active-two': _vm.innerTo != null && day.date.getTime() === _vm.innerTo.getTime(),
          'is-active-between': _vm.innerFrom != null && _vm.innerTo != null && day.date.getTime() > _vm.innerFrom && day.date.getTime() < _vm.innerTo
        },
        on: {
          "click": function click($event) {
            return _vm.dateClicked(day);
          },
          "mouseover": function mouseover($event) {
            return _vm.updateHoverDate(day);
          }
        }
      }, [_vm._v("\n            " + _vm._s(day.date.getDate()) + "\n          ")]);
    }), 0);
  })], 2), _vm._v(" "), _vm.type === 'datetime' ? _c('div', {
    staticClass: "dp-month-year field has-addons"
  }, [_c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedHour,
      expression: "selectedHour"
    }],
    on: {
      "change": [function ($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedHour = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }, _vm.setTimeOnFrom]
    }
  }, [_c('option', {
    domProps: {
      "value": 1
    }
  }, [_vm._v("1")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 2
    }
  }, [_vm._v("2")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 3
    }
  }, [_vm._v("3")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 4
    }
  }, [_vm._v("4")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 5
    }
  }, [_vm._v("5")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 6
    }
  }, [_vm._v("6")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 7
    }
  }, [_vm._v("7")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 8
    }
  }, [_vm._v("8")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 9
    }
  }, [_vm._v("9")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 10
    }
  }, [_vm._v("10")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 11
    }
  }, [_vm._v("11")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 12
    }
  }, [_vm._v("12")])])])]), _vm._v(" "), _c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedMinute,
      expression: "selectedMinute"
    }],
    on: {
      "change": [function ($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedMinute = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }, _vm.setTimeOnFrom]
    }
  }, [_c('option', {
    domProps: {
      "value": 0
    }
  }, [_vm._v("00")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 15
    }
  }, [_vm._v("15")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 30
    }
  }, [_vm._v("30")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 45
    }
  }, [_vm._v("45")])])])]), _vm._v(" "), _c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedAMPM,
      expression: "selectedAMPM"
    }],
    on: {
      "change": [function ($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedAMPM = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }, _vm.setTimeOnFrom]
    }
  }, [_c('option', {
    domProps: {
      "value": 0
    }
  }, [_vm._v("AM")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 12
    }
  }, [_vm._v("PM")])])])]), _vm._v(" "), _c('div', {
    staticClass: "control"
  }, [_c('button', {
    staticClass: "button is-success"
  }, [_vm._v("Set")])])]) : _vm._e()])])], 2);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = __vue_normalize__({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

var index = {
  install: function install(Vue, options) {
    // Let's register our component globally
    // https://vuejs.org/v2/guide/components-registration.html
    Vue.component("range-date-picker", __vue_component__);
  }
};

module.exports = index;
