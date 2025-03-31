<template>
  <div>
    <ckeditor
      :key="`ck-editor-${key}`"
      :editor="editor"
      :config="editorConfig"
      :disabled="ready ? disabled : false"
      :value="value"
      @input="change"
      @ready="onReady"
    />
    <div :class="`text-right text-caption ${dataUsage.color}`">
      {{ dataUsage.percentText }}
    </div>
  </div>
</template>

<script>
// Importando apenas os componentes básicos e essenciais
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import EssentialsPlugin from "@ckeditor/ckeditor5-essentials/src/essentials";
import BoldPlugin from "@ckeditor/ckeditor5-basic-styles/src/bold";
import ItalicPlugin from "@ckeditor/ckeditor5-basic-styles/src/italic";
import LinkPlugin from "@ckeditor/ckeditor5-link/src/link";
import ParagraphPlugin from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Base64UploadAdapter from "@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter";
import SimpleUploadAdapter from "@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter";
import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";
import TodoList from "@ckeditor/ckeditor5-list/src/todolist";
import ListPlugin from "@ckeditor/ckeditor5-list/src/list";
import vue from "@/main";

// Removemos todas as referências a imports problemáticos
// Não importar Image, ImageToolbar, ImageStyle, ImageResize, ImageUpload, LinkImage

export default {
  props: {
    value: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    disableToolbar: {
      type: Boolean,
      default: false,
    },
    imgUploadUrl: {
      type: String,
      default: () =>
        `${
          process.env.VUE_APP_API_PROTOCOL || "https"
        }://${process.env.VUE_APP_BACKEND_URL.replace("http://", "").replace(
          "https://",
          ""
        )}/ticket/upload/image`,
    },
    extraHeaders: {
      type: Object,
      default: () => {},
    },
  },
  data: function () {
    return {
      key: 0,
      text: "",
      changed: false,
      editor: ClassicEditor,
      editorData: "",
      interval: null,
      ready: false,
      editorConfig: {
        ready: false,
        height: "300px",
        placeholder: "Descreva em detalhes...",
        // Reduzindo os plugins para incluir apenas os essenciais
        plugins: [
          Base64UploadAdapter,
          SimpleUploadAdapter,
          EssentialsPlugin,
          BoldPlugin,
          ItalicPlugin,
          LinkPlugin,
          ParagraphPlugin,
          Alignment,
          TodoList,
          ListPlugin
          // Removemos todos os plugins relacionados a imagem
        ],
        font_style: {
          styles: {
            color: "black",
          },
        },
        alignment: {
          options: ["left", "center", "right"],
        },
        // Remover quaisquer referências a ferramentas de imagem da barra de ferramentas
        toolbar: [
          "bold",
          "italic",
          "link",
          "alignment",
          "|",
          "numberedList",
          "bulletedList",
          "todolist",
          "|",
          "undo",
          "redo",
        ],
        // Remover completamente a configuração de imagem
      },
      language: "pt",
    };
  },

  computed: {
    dataUsage: function () {
      let color = "";
      const percent = (this.editorData.length * 100) / 921600;
      if (percent > 100) {
        color = "red--text";
      }

      return {
        percentValue: percent,
        percentText: `${percent.toFixed(0)}%`,
        color,
      };
    },
  },

  created() {
    if (this.value) {
      this.editorData = this.value;
    }
  },

  mounted() {
    this.interval = setInterval(() => {
      if (this.changed) {
        this.changed = false;
        this.$emit("input", this.text);
      }
    }, 1e3);
  },

  destroyed() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  methods: {
    getDataUsage() {
      return this.dataUsage.percentValue;
    },

    change(val) {
      if (this.ready) {
        this.changed = true;
        this.text = val;
        this.editorData = val; // Atualiza editorData para o cálculo de uso
      }
    },

    onReady() {
      this.ready = true;
    },

    async restart() {
      this.ready = false;
      this.key++;
    },
  },
};
</script>

<style>
.ck-editor__editable {
  min-height: 200px;
  max-height: 600px;
}
</style>