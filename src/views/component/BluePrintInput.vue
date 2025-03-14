<template>
  <div>
    <slot
      :error-messages="errMsg"
      :model="value"
    />
  </div>
</template>

<script>
  import BluePrintValidate from '@/views/component/BluePrintValidate'
  export default {
    extends: BluePrintValidate,
    props: {
      value: {
        type: String || Array || Object,
        default: () => null,
      },
    },
    watch: {
      value: function (val) {
        this.model = val
      },
    },
  }
</script>
