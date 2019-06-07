<template>
  <div class="dp-range-date override"><!-- .dp-range-date.o-h override hook for more explicit css -->
    <div v-show="isPickerActive" class="dp-click-overlay" @click="closePicker"></div>
    <input class="dp-input" @click="togglePicker" readonly :value="fmttedRangeDate" />
    <transition>
      <div v-show="isPickerActive" class="dp-picker">
        <div class="dp-month-year">
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
          <div class="dp-month-year-spacer"></div>
          <div class="select is-medium">
            <select v-model="selectedYear">
              <option v-for="(year, index) in yearRange" :key="index" :value="year">{{year}}</option>
            </select>
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
                'is-hovered': hoverDate != null && innerDateOne != null && day.date.getTime() > innerDateOne && day.date.getTime() < hoverDate, 
                'is-active-one': innerDateOne != null && day.date.getTime() === innerDateOne.getTime(), 
                'is-active-two': innerDateTwo != null && day.date.getTime() === innerDateTwo.getTime(),
                'is-active-between': innerDateOne != null && innerDateTwo != null && day.date.getTime() > innerDateOne && day.date.getTime() < innerDateTwo
                }"
              v-for="(day, index) in dayrow" :key="index">
              {{day.date.getDate()}}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
// ... imports
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

export default {
  // COMPONENT
  // ______________________________________
  name: 'RangeDatePicker',
  props: {
    cssPrefix: {
      type: String,
      default: ''
    },
    startDate: Date,
    endDate: Date,
    dateOne: Date,
    dateTwo: Date
  },
  components: {},
  mixins: [
    'bcContext'
  ],
  computed: {
    fmttedRangeDate () {
      let fmt = ''
      if (this.innerDateOne) {
        fmt += rd_fmt(this.innerDateOne)
      }
      if (this.innerDateTwo) {
        fmt += ' - ' + rd_fmt(this.innerDateTwo)
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
    }
  },
  methods: {
    dateClicked (day) {
      this.hoverDate = null
      let hasDateOne = (this.innerDateOne !== null)
      let hasDateTwo = (this.innerDateTwo !== null)

      if (hasDateTwo) {
        this.innerDateOne = day.date
        this.$emit('date-one-changed', day.date)
        this.innerDateTwo = null
        this.$emit('date-two-changed', null)
        return
      }

      if (hasDateOne && this.innerDateOne.getTime() < day.date.getTime()) {
        this.innerDateTwo = day.date
        this.$emit('date-two-changed', day.date)
        this.isPickerActive = false
        return
      }
      this.innerDateOne = day.date
      this.$emit('date-one-changed', day.date)
    },
    updateStartDate (day) {
      this.startDate = day.date
    },
    updateHoverDate (day) {
      if (this.innerDateOne !== null && this.innerDateTwo === null) {
        this.hoverDate = day.date
      } 
    },
    closePicker () {
      this.isPickerActive = false
    },
    togglePicker () {
      this.isPickerActive = !this.isPickerActive
    }
  },
  watch: {},
  data () {
    return {
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      start: null,
      hoverDate: null,
      isPickerActive: false,
      innerDateOne: null,
      innerDateTwo: null
    }
  },

  // LIFECYCLE METHODS
  // ______________________________________
  beforeCreate () {
  },
  created () {
    if (this.dateOne) {
      this.innerDateOne = this.dateOne
    }
    if (this.dateTwo) {
      this.innerDateTwo = this.dateTwo
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
  border-radius: 1rem;
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
