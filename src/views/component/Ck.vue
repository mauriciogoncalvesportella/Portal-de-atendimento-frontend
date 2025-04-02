<template>
  <div>
    <ckeditor
      :editor="editor"
      :config="editorConfig"
      :disabled="ready ? disabled : false"
      v-model="editorData"
      @ready="onReady"
    />
    <div :class="`text-right text-caption ${dataUsage.color}`">
      {{ dataUsage.percentText }}
    </div>
  </div>
</template>

<script>
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import CKEditor from "@ckeditor/ckeditor5-vue";
import vue from "@/main";

export default {
  components: {
    ckeditor: CKEditor.component,
  },
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
  data() {
    return {
      editor: ClassicEditor, // Inicializa ClassicEditor aqui
      editorConfig: {
        height: "300px",
        placeholder: "Descreva em detalhes...",
        alignment: {
          options: ["left", "center", "right"],
        },
        toolbar: [
          "bold",
          "italic",
          "link",
          "alignment",
          "subscript", // Adicionado
          "superscript", // Adicionado
          "|",
          "outdent", // Adicionado
          "indent", // Adicionado
          "numberedList",
          "bulletedList",
          "todolist",
          "|",
          "insertImage", // Adicionado
          "insertTable", // Adicionado
          "|",
          "undo",
          "redo",
        ],
      },
      editorData: this.value, // Inicializa com o valor do prop
      ready: false,
      key: 0,
      text: "",
      changed: false,
      interval: null,
    };
  },

  computed: {
    dataUsage() {
      if (!this.editorData)
        return { percentValue: 0, percentText: "0%", color: "" };

      const percent = (this.editorData.length * 100) / 921600;
      const color = percent > 100 ? "red--text" : "";

      return {
        percentValue: percent,
        percentText: `${percent.toFixed(0)}%`,
        color,
      };
    },
  },

  created() {
    // Move a inicialização de editorData para o data()
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
        this.editorData = val;
      }
    },

    onReady(editor) {
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
