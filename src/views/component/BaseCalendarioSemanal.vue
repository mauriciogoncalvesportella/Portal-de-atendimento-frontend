<template>
  <div
    :key="`div-key-${keyCont}`"
    class="d-flex"
    :style="errMsg ? 'border: 1px solid red' : ''"
  >
    <v-hover
      v-for="n in 7"
      :key="`hover-${n}`"
      v-slot="{ hover }"
    >
      <v-sheet
        class="px-2 py-5 text-center flex-grow-1"
        style="margin: 2px; cursor: pointer"
        :elevation="hover ? '4' : '1'"
        tile
        :dark="model[n]"
        :color="model[n] ? 'primary' : 'white'"
        @click="clickEvent(n)"
      >
        {{ text(n) }}
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
        diaSemana: [
          'Domingo',
          'Segunda-feira',
          'Terça-feira',
          'Quarta-feira',
          'Quinta-feira',
          'Sexta-feira',
          'Sábado',
        ],
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
            this.model[key + 1] = true
          }
        }
      },

      text (i) {
        if (this.$vuetify.breakpoint.name === 'xs') {
          return this.diaSemana[i - 1][0]
        }

        if (this.$vuetify.breakpoint.smAndDown) {
          return this.diaSemana[i - 1].split('-')[0]
        }

        return this.diaSemana[i - 1]
      },

      clickEvent (n) {
        const ret = []
        this.model[n] = (this.model[n] == null) ? true : !this.model[n]

        for (const key in this.model) {
          if (this.model[key]) {
            ret.push(key - 1)
          }
        }
        this.errMsg = null
        this.$emit('input', ret)
        this.keyCont++
      },
    },
  }
</script>
