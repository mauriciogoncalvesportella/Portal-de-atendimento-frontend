<template>
  <vue-resizable
    :height="height"
    class="d-inline"
    :active="active"
    fit-parent
    style="background-color: pink"
    @resize:move="moveHandle"
  >
    <slot />
  </vue-resizable>
</template>

<script>
  export default {
    props: {
      value: {
        type: Number,
        default: 0,
      },
      active: {
        type: Array,
        default: () => ['r', 'rb', 'b', 'lb', 'l', 'lt', 't', 'rt'],
      },
    },

    methods: {
      moveHandle (data) {
        this.$emit('input', data.height)
      },
    },
  }
</script>
