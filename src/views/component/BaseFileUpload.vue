<template>
  <div
    class="d-flex flex-row"
  >
    <input
      ref="file"
      type="file"
      style="display: none"
      multiple
      @change="hideInputDialog"
    >
    <v-btn
      tile
      depressed
      :height="btnHeight"
      :disabled="disabled"
      @click="openInputDialog"
    >
      <v-icon>mdi-paperclip</v-icon>
      Anexar
    </v-btn>
    <div
      style="width: 100%"
    >
      <v-chip
        v-for="(item, i) in items"
        :key="`${item.name}-${i}`"
        class="ma-1"
        close
        @click:close="deleteFile(item)"
      >
        <span
          class="text-truncate mr-1"
          style="max-width: 150px"
        >
          {{ item.name }}
        </span>
        ({{ item.size | bytes2human }})
      </v-chip>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      value: {
        type: Array,
        default: () => [],
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      btnHeight: {
        type: Number,
        default: 40,
      },
    },

    data: () => ({
      itemsPerPage: 5,
      files: [],
      filesChecked: {},
      headers: [
        { text: 'Arquivo', value: 'name' },
        { text: 'Tamanho', value: 'size', align: 'end', width: '100px' },
        { text: '', value: 'action', sortable: false, align: 'end', width: '83px' },
      ],
    }),

    computed: {
      items: function () {
        return this.files.map(item => {
          return {
            name: item.name,
            size: item.size,
          }
        })
      },
    },

    watch: {
      files: function (val) {
        this.$emit('input', val)
      },

      value (newValue) {
        this.files = newValue
      },
    },

    methods: {
      openInputDialog () {
        this.$refs.file.click()
      },

      hideInputDialog (value) {
        let tmpFiles = [...value.target.files]
        tmpFiles = tmpFiles.filter(item => {
          if (!this.filesChecked[item.name]) {
            this.filesChecked[item.name] = true
            return true
          }
          return false
        })
        this.files = [...tmpFiles, ...this.files]
      },

      deleteFile (item) {
        this.filesChecked[item.name] = false
        const index = this.files.findIndex(it => it.name === item.name)
        if (this.files[index]) {
          this.files.splice(index, 1)
        }

        if (this.files.length === 0) {
          this.files = []
          this.filesChecked = {}
        }
      },
    },
  }
</script>
