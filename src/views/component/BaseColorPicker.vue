<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    min-height="400"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model.lazy="model"
        label="Código cor"
        prepend-icon="mdi-palette"
        filled
        readonly
        validate-on-blur
        :error-messages="errMsg"
        v-on="on"
      >
        <template v-slot:append>
          <v-icon
            size="15"
            :color="model"
            right
          >
            mdi-checkbox-blank-circle
          </v-icon>
        </template>
      </v-text-field>
    </template>
    <v-sheet
      class="pa-3"
    >
      <v-color-picker
        v-model="modelColorPicker"
        class="mx-auto"
        hide-inputs
        mode="hexa"
      />
      <div
        class="d-flex justify-end"
      >
        <v-btn
          tile
          color="primary"
          @click="handleSalvar"
        >
          Salvar
        </v-btn>
      </div>
    </v-sheet>
  </v-menu>
</template>

<script>
  import BluePrintValidate from '@/views/component/BluePrintValidate.vue'
  export default {
    extends: BluePrintValidate,
    props: {
      value: {
        type: String,
        default: null,
      },
    },

    data () {
      return {
        menu: false,
        model: null,
        modelColorPicker: null,
      }
    },

    methods: {
      handleSalvar () {
        this.menu = false
        this.model = this.modelColorPicker.hexa
        this.$emit('input', this.model)
      },
    },
  }
</script>
