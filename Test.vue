<template>
  <div>
    <div>
      date
      <range-date-picker v-model="d" type="date"></range-date-picker>
      {{d}}
    </div>
    <div>
      datetime
      <range-date-picker v-model="dt" type="datetime"></range-date-picker>
      {{dt}}
    </div>
    <div>
      rangedate
      <range-date-picker v-model="range" type="rangedate"></range-date-picker>
      {{range}}
    </div>
  </div>
</template>

<script>
import RangeDatePicker from './RangeDatePicker'

export default {
  // COMPONENT
  // ______________________________________
  components: {
    RangeDatePicker
  },
  mixins: [],
  props: {},
  data () {
    return {
      d: null,
      dt: null,
      range: null
    }
  },
  computed: {},
  methods: {},
  watch: {},

  // LIFECYCLE METHODS
  // ______________________________________
  beforeCreate () {
  },
  created () {
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

<style lang="scss">

</style>
