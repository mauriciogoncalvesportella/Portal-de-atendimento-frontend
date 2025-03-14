<template>
  <div
    :key="`div-key-${keyCont}`"
    class="d-flex flex-wrap mx-auto my-auto"
    :style="errMsg ? 'border: 1px solid red' : ''"
  >
    <v-hover
      v-for="n in 31"
      :key="`hover-${n}`"
      v-slot="{ hover }"
    >
      <v-sheet
        class="pa-1 text-center"
        style="margin: 2px; cursor: pointer"
        height="32"
        width="32"
        :elevation="hover ? '4' : '1'"
        tile
        :dark="model[n] ? true : false"
        :color="model[n] ? 'primary' : 'white'"
        @click="clickEvent(n)"
      >
        {{ n }}
      </v-sheet>
    </v-hover>
  </div>
</template>

<script>
  import BluePrintValidate from '@/views/component/BluePrintValidate.vue'
  export default {
    extends: BluePrintValidate,
    props: {
      value: {
        type: Array,
        default: () => [],
      },
    },
    data () {
      return {
        model: {},
        keyCont: 0,
      }
    },

    mounted () {
      this.updateModel()
    },

    methods: {
      updateModel () {
        this.model = {}
        if (this.value?.length > 0) {
          for (const key of this.value) {
            this.model[key] = true
          }
        }
      },

      clickEvent (n) {
        const ret = []
        this.model[n] = (this.model[n] == null) ? true : !this.model[n]
        for (const key in this.model) {
          if (this.model[key]) {
            ret.push(key)
          }
        }
        this.errMsg = null
        this.$emit('input', ret)
        this.keyCont++
      },
    },
  }
</script>
