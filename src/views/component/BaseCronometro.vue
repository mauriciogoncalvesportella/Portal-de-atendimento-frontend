<template>
  <v-chip
    class="text-overline"
  >
    <v-icon
      left
    >
      mdi-clock
    </v-icon>
    <span
      :key="`span-${key}`"
    >
      {{ date | duration2format(format) }}
    </span>
  </v-chip>
</template>

<script>
  export default {
    props: {
      date: {
        type: String,
        default: null,
      },
      format: {
        type: Object,
        default: () => ({
          format: ['days', 'hours', 'minutes'],
        }),
      },
    },

    data: () => ({
      key: 0,
      interval: null,
    }),

    created () {
      this.interval = setInterval(() => ++this.key, 20e3)
    },

    destroyed () {
      clearInterval(this.interval)
    },
  }
</script>
