<template>
  <vue-custom-scrollbar
    v-resize="onResize"
    :style="`position: relative; height: ${height}`"
  >
    {{ height }}
    <slot
      ref="slot"
    />
  </vue-custom-scrollbar>
</template>

<script>
  import vueCustomScrollbar from 'vue-custom-scrollbar'
  import 'vue-custom-scrollbar/dist/vueScrollbar.css'

  export default {
    components: {
      vueCustomScrollbar,
    },
    props: {
      breakpoint: {
        type: String,
        default: 'smAndDown',
      },
      yOffset: {
        type: Number,
        default: 0,
      },
    },

    data () {
      return {
        height: '100%',
      }
    },

    methods: {
      onResize () {
        if (this.$vuetify.breakpoint[this.breakpoint]) {
          this.height = '100%'
        } else {
          this.height = Math.max(window.innerHeight - this.yOffset)
        }
      },
    },
  }
</script>
