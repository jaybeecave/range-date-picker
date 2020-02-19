<template>
  <div class="dp-range-date override" :class="{'is-range': isRangePicker}"><!-- .dp-range-date.o-h override hook for more explicit css -->
    <div v-show="isPickerActive" class="dp-click-overlay" @click="closePicker"></div>
    <input ref="inp" class="dp-input" @blur="parseDate"/>
    <slot name="buttons">
      <button class="dp-open-button button is-primary" @click="togglePicker">
        <i class="far fa-calendar" />
      </button>
    </slot>
    <transition>
      <div v-show="isPickerActive" class="dp-picker">
        <div class="dp-month-year field has-addons">
          <div class="control">
            <div class="select is-medium">
              <select v-model="selectedMonth">
                <option :value="0">Jan</option>
                <option :value="1">Feb</option>
                <option :value="2">Mar</option>
                <option :value="3">Apr</option>
                <option :value="4">May</option>
                <option :value="5">Jun</option>
                <option :value="6">Jul</option>
                <option :value="7">Aug</option>
                <option :value="8">Sept</option>
                <option :value="9">Oct</option>
                <option :value="10">Nov</option>
                <option :value="11">Dec</option>
              </select>
            </div>
          </div>
          <div class="control">
            <div class="select is-medium">
              <select v-model="selectedYear">
                <option v-for="(year, index) in yearRange" :key="index" :value="year">{{year}}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="dp-days">
          <div class="dp-day-row dp-day-header">
            <div class="dp-day dp-day-text" v-for="(dayText, index) in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="index">
              {{dayText}}
            </div>
          </div>
          <div class="dp-day-row" v-for="(dayrow, index) in dayRows" :key="index">
            <div class="dp-day" @click="dateClicked(day)" @mouseover="updateHoverDate(day)" 
              :class="{
                'is-diff-month': day.date.getMonth() !== selectedMonth,
                'is-hovered': hoverDate != null && innerFrom != null && day.date.getTime() > innerFrom && day.date.getTime() < hoverDate, 
                'is-active-one': innerFrom != null && day.date.getTime() === innerFrom.getTime(), 
                'is-active-two': innerTo != null && day.date.getTime() === innerTo.getTime(),
                'is-active-between': innerFrom != null && innerTo != null && day.date.getTime() > innerFrom && day.date.getTime() < innerTo
                }"
              v-for="(day, index) in dayrow" :key="index">
              {{day.date.getDate()}}
            </div>
          </div>
        </div>
        <div v-if="type === 'datetime'" class="dp-month-year field has-addons">
          <div class="control">
            <div class="select is-medium">
              <select v-model="selectedHour" @change="setTimeOnFrom">
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
                <option :value="5">5</option>
                <option :value="6">6</option>
                <option :value="7">7</option>
                <option :value="8">8</option>
                <option :value="9">9</option>
                <option :value="10">10</option>
                <option :value="11">11</option>
                <option :value="12">12</option>
              </select>
            </div>
          </div>
          <div class="control">
            <div class="select is-medium">
              <select v-model="selectedMinute" @change="setTimeOnFrom">
                <option :value="0">00</option>
                <option :value="15">15</option>
                <option :value="30">30</option>
                <option :value="45">45</option>
              </select>
            </div>
          </div>
          <div class="control">
            <div class="select is-medium">
              <select v-model="selectedAMPM" @change="setTimeOnFrom">
                <option :value="0">AM</option>
                <option :value="12">PM</option>
              </select>
            </div>
          </div>
          <div class="control">
            <button class="button is-success">Set</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import parseTime from 'parsetime'
const month_names =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function rd_getDOY (now) {
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return day
}

function rd_fmt(date) {
    var day = date.getDate();
    var month_index = date.getMonth();
    var year = date.getFullYear();
    
    return "" + day + " " + month_names[month_index] + " " + year;
}

function rd_fmttime(date) {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let amPm = 'AM'
  if (hours > 11) {
    amPm = 'PM'
  }
  if (hours === 0) {
    hours = 12
  }
  if (hours > 12) {
    hours = hours - 12
  }
  if (minutes < 10) {
    minutes = '0'+minutes
  }
  return hours + ':' + minutes + ' '+amPm
}


export default {
  // COMPONENT
  // ______________________________________
  name: 'RangeDatePicker',
  props: {
    type: {
      type: String,
      required: true,
      validator: function (value) {
        // The value must match one of these strings
        return ['date', 'datetime', 'rangedate'].indexOf(value) !== -1
      }
    },
    cssPrefix: {
      type: String,
      default: ''
    },
    startDate: Date,
    endDate: Date,
    from: Date,
    to: Date,
    isRange: Boolean
  },
  components: {},
  computed: {
    isRangePicker () {
      return this.type.indexOf('range') >= 0
    },
    fmttedRangeDate () {
      let fmt = ''
      if (this.innerFrom) {
        fmt += rd_fmt(this.innerFrom)
      }
      if (this.innerTo) {
        fmt += ' - ' + rd_fmt(this.innerTo)
      }
      return fmt
    },
    selectedDate () {
      return new Date(this.selectedYear, this.selectedMonth, 1)
    },
    selectedDateDayOfYear () {
      return rd_getDOY(this.selectedDate)
    },
    yearRange () {
      let start = new Date().getFullYear()
      let end = new Date(new Date().getFullYear()+10)
      if (this.startDate) {
        start = new Date(this.startDate)
      }
      if (this.endDate) {
        end = new Date(this.endDate)
      }
      let years = []
      while (start < end) {
        years.push(start)
        start++
      }
      return years
    },
    dayRows () {
      // THIS always starts on sunday.. so if your month starts on a monday then sunday will be a 0 array item
      let days = []
      let i = 0
      let selectedDay = this.selectedDate.getDay()
      let monthEnd = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth()+1, 0).getDate()
      //padd start of month
      while (i < selectedDay && i < 32) {
        days.push(0)
        i++
      }
      i = 1 // one based cause dates don't start at 0
      while (i <= monthEnd && i < 32) {
        days.push(i)
        i++
      }
      let dayRows = []
      let dayRow = []
      for (let i = 0; i < days.length; i++) {
        if (i % 7 == 0 && i !== 0) {
          dayRows.push(dayRow)
          dayRow = []
        }
        dayRow.push({
          dayNum: days[i],
          date: new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), i - selectedDay + 1) //+1 for 0 based index with offset of padded days
        })
      }
      //padd end of month
      let padEnd = 7 - dayRow.length
      i = 1
      while (i <= padEnd && i < 32) {
        dayRow.push({
          dayNum: 0,
          date: new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth()+1, i)
        })
        i++
      }
      dayRows.push(dayRow)
      return dayRows
    },
    pfx () {
      return this.cssPrefix
    },
    hasFrom ()  {
      return (this.innerFrom !== null)
    },
    hasTo () {
      return (this.innerTo !== null)
    }
  },
  methods: {
    parseDate (ev) {
      let val = ev.target.value

      let parsed = parseTime(val)
      if (parsed.absolute) {
        this.setFrom(new Date(parsed.absolute))
      }

      if (val.indexOf('-') > 0) {
        let toVal = val.split('-')
        if (toVal.length > 0) {
          val = toVal[1]
        }

        let parsed = parseTime(val)
        if (parsed.absolute) {
          this.setTo(new Date(parsed.absolute))
        }
      }

      this.closePicker()
    },
    dateClicked (day) {
      this.hoverDate = null
      if (this.isRangePicker) {
        if (this.hasTo) {
          this.setFrom(day.date)
          this.setTo(null)
          return
        }

        if (this.hasFrom && this.innerFrom.getTime() < day.date.getTime()) {
          this.setTo(day.date)
          this.isPickerActive = false
          this.$emit('input', {from: this.innerFrom, to: this.innerTo})
          return
        }
      }

      this.setFrom(day.date)
      if (this.isRangePicker) {
        this.$emit('input', {from: this.innerFrom, to: this.innerTo})
      } else {
        this.$emit('input', this.innerFrom)
        if (this.type !== 'datetime') {
          this.isPickerActive = false
        }
      }
    },
    updateStartDate (day) {
      this.startDate = day.date
    },
    updateHoverDate (day) {
      if (!this.isRangePicker) {
        return
      }
      if (this.innerFrom !== null && this.innerTo === null) {
        this.hoverDate = day.date
      } 
    },
    closePicker () {
      this.isPickerActive = false
    },
    togglePicker () {
      this.isPickerActive = !this.isPickerActive
    },
    setFrom (val) {
      this.innerFrom = val
      if (this.type === 'datetime') {
        this.setTimeOnFrom()
      }
      this.$emit('from-changed', this.innerFrom)
      this.formatField()
    },
    setTimeOnFrom () {
      let dt = this.innerFrom ? new Date(this.innerFrom) : new Date()
      let hours = this.selectedHour
      if (this.selectedAMPM === 0 && hours === 12) {
        hours = 0
      } else if (this.selectedAMPM === 12 && hours < 12) {
        hours = this.selectedHour + this.selectedAMPM
      }
      dt.setHours(hours)
      dt.setMinutes(this.selectedMinute)
      this.innerFrom = dt
    },
    setTo (val) {
      this.innerTo = val
      this.$emit('to-changed', this.innerTo)
      this.formatField()
    },
    formatField () {
      let result = ''
      if (this.innerFrom) {
        result = rd_fmt(this.innerFrom)
        if (this.type.indexOf('time') > -1) {
          result += ' ' + rd_fmttime(this.innerFrom)
        }
      }
      if (this.isRangePicker) {
        result += ' - '
      }
      if (this.innerTo) {
        result += rd_fmt(this.innerTo)
        if (this.type.indexOf('time') > -1) {
          result += ' ' + rd_fmttime(this.innerTo)
        }
      }
      this.$refs.inp.value = result
    }
  },
  watch: {},
  data () {
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
    }
  },

  // LIFECYCLE METHODS
  // ______________________________________
  beforeCreate () {
  },
  created () {
    if (Object.hasOwnProperty(this.value, 'to')) {
      this.innerFrom = this.value.from
      this.innerTo = this.value.to
    }
    if (this.from || this.value) {
      this.innerFrom = this.from || this.value
    }
    if (this.to) {
      this.innerTo = this.to
    }
  },
  beforeMount () {
  },
  mounted () {

  },
  beforeUpdate () {
  },
  updated () {
  },
  beforeDestroy () {
  },
  destroyed () {
  }
}
</script>

<style lang="css">
.dp-range-date .dp-click-overlay {
  position: fixed;
  background: rgba(0, 0, 0, 0.2);
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
}
.dp-range-date {
  position: relative;
  width: 100%;
}
.dp-range-date .dp-input {
  position: relative;
  width: 100%;
}
.dp-range-date .dp-picker{
  background: white;
  position: absolute;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
  padding: 0.5rem;
  z-index: 2;
}
.dp-range-date .dp-month-year {
  display: flex;
}
.dp-range-date .dp-month-year .dp-month-year-spacer{
  display: block;
  width: 0.5rem;
}
.dp-range-date .dp-days .dp-day-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.dp-range-date .dp-days .dp-day-row .dp-day {
  cursor: pointer;
  width: 14.25%;
  text-align: center;
  padding: 0.25rem 0.5rem;
  margin-left: -1px;
}
.dp-range-date .dp-days .dp-day-row .dp-day.is-diff-month{
  color: grey;
}
.dp-range-date .dp-days .dp-day-row .dp-day:hover,
.dp-range-date .dp-days .dp-day-row .dp-day.is-hovered {
  background: red;
}
.dp-range-date .dp-days .dp-day-row .dp-day.is-active-one {
  background: purple;
}
.dp-range-date .dp-days .dp-day-row .dp-day.is-active-two {
  background: orange;
}
.dp-range-date .dp-days .dp-day-row .dp-day.is-active-between {
  background: yellow;
}
.dp-range-date .dp-days .dp-day-row .dp-day.dp-day-text {
  font-size: 0.7rem;
  color: grey;
  text-transform: uppercase;
  background: white !important;
}
</style>
