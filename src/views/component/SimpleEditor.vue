<template>
    <div>
      <v-textarea
        outlined
        :value="value"
        @input="$emit('input', $event)"
        :disabled="disabled"
        :placeholder="'Descreva em detalhes...'"
        class="editor-textarea"
        rows="8"
        auto-grow
      ></v-textarea>
      <div :class="`text-right text-caption ${dataUsage.color}`">
        {{ dataUsage.percentText }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: {
        type: String,
        default: ""
      },
      disabled: {
        type: Boolean,
        default: false
      },
      extraHeaders: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        editorData: ""
      };
    },
    computed: {
      dataUsage: function() {
        let color = "";
        const stringLength = (this.value || "").length;
        const percent = (stringLength * 100) / 921600;
        if (percent > 100) {
          color = "red--text";
        }
  
        return {
          percentValue: percent,
          percentText: `${percent.toFixed(0)}%`,
          color
        };
      }
    },
    watch: {
      value: {
        immediate: true,
        handler(val) {
          this.editorData = val || "";
        }
      }
    },
    methods: {
      // Métodos compatíveis com o CKEditor para manter a compatibilidade
      getDataUsage() {
        return this.dataUsage.percentValue;
      },
      async restart() {
        // Método vazio para compatibilidade
        return true;
      }
    }
  };
  </script>
  
  <style>
  .editor-textarea {
    border-radius: 4px;
    font-family: inherit !important;
  }
  </style>