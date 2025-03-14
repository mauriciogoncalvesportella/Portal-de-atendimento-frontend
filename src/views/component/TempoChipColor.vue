<template>
  <v-chip
    :color="chipColor.color"
    :dark="chipColor.dark"
    :small="small"
    :label="label"
  >
    <v-icon
      v-if="icon"
      :small="small"
      left
    >
      mdi-timer
    </v-icon>
    <template
      v-if="!chipColor.disable"
    >
      {{ time | sec2date }}
    </template>
  </v-chip>
</template>

<script>
  export default {
    props: {
      sec: {
        type: Number,
        default: null,
      },
      config: {
        type: Array,
        default: () => [
          { time: 60, color: 'red', dark: true },
          { time: 30, color: 'orange', dark: true },
          { time: 15, color: 'yellow lighten-1', dark: false },
          { time: 0, color: 'green', dark: true },
          { time: -1 },
        ],
      },
      small: {
        type: Boolean,
        default: true,
      },
      icon: {
        type: Boolean,
        default: false,
      },
      label: {
        type: Boolean,
        default: false,
      },
      updateEach: {
        type: Number,
        default: null,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },

    data () {
      return {
        time: this.sec,
        interval: null,
      }
    },

    computed: {
      chipColor () {
        if (!this.time) {
          return {
            color: '',
            dark: false,
          }
        }

        const min = this.time / (1000.0 * 60.0)
        for (const i of this.config) {
          if (min >= i.time) {
            return i
          }
        }

        return {
          color: '',
          dark: false,
          disabled: true,
        }
      },
    },

    watch: {
      sec (val) {
        this.time = this.sec
      },
    },

    created () {
      if (this.updateEach) {
        this.interval = setInterval(() => {
          if (this.isActive) {
            this.time += this.updateEach
          }
        }, this.updateEach)
      }
    },

    destroyed () {
      clearInterval(this.interval)
      this.interval = null
    },
  }
</script>
