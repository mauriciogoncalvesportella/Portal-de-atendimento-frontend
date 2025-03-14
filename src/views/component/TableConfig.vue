<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      fullscrean
      max-width="800px"
    >
      <template #activator="{ on }">
        <v-btn
          icon
          v-on="on"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          <span class="text-h5"> Editor Tabela </span>
        </v-card-title>

        <v-card-text>
          <v-container fluid>
            <v-data-table
              :key="componentKey"
              calculate-widths
              :headers="head"
              :items="data"
              :hide-default-footer="true"
              :disable-pagination="true"
              dense
            >
              <template #[`item.width`]="{ item }">
                <v-slider
                  v-model="item.width"
                  :max="500"
                  :min="10"
                  small
                  thumb-label
                />
              </template>

              <template #[`item.align`]="{ item }">
                <v-select
                  v-model="item.align"
                  small
                  :items="columnOptions"
                />
              </template>

              <template #[`item.enabled`]="{ item }">
                <v-checkbox
                  v-model="item.enabled"
                  @change="sync"
                />
              </template>

              <template #[`item.moveDown`]="{ item }">
                <v-btn
                  icon
                  color="primary"
                  @click="move(item, 1)"
                >
                  <v-icon> mdi-arrow-down-bold </v-icon>
                </v-btn>
              </template>

              <template #[`item.moveUp`]="{ item }">
                <v-btn
                  icon
                  color="primary"
                  @click="move(item, -1)"
                >
                  <v-icon> mdi-arrow-up-bold </v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="red darken-1"
            text
            @click="dialog = false"
          >
            Sair
          </v-btn>
          <v-btn
            color="blue darken-1"
            type="submit"
            text
            :loading="loading"
            @click="save"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    props: {
      value: {
        type: Array,
        default: () => [],
      },
      baseHead: {
        type: Array,
        default: () => [],
      },
      nmtable: {
        type: String,
        default: '',
      },
    },

    data () {
      return {
        head: [
          { text: 'Coluna', value: 'text', sortable: false },
          { text: 'Tamanho (px)', value: 'width', width: 200, sortable: false },
          { text: 'Alinhamento', value: 'align', sortable: false },
          { text: 'Exibir', value: 'enabled', sortable: false },
          { text: 'Descer', value: 'moveDown', align: 'center', sortable: false },
          { text: 'Subir', value: 'moveUp', align: 'center', sortable: false },
        ],
        columnOptions: ['left', 'center', 'right'],
        data: [],
        result: [],
        dialog: false,
        loading: false,
        componentKey: 0,
      }
    },

    mounted () {
      this.refresh()
    },

    methods: {
      move (item, step) {
        const i = this.data.findIndex(da => da === item)
        if (i + step >= 0 && i + step < this.data.length) {
          [this.data[i], this.data[i + step]] = [this.data[i + step], this.data[i]]
        }
        // Forçar rerender --> https://michaelnthiessen.com/force-re-render/
        this.componentKey++
        this.sync()
      },

      sync () {
        const result = this.data.filter(da => da.enabled)
        this.$emit('input', result)
      },

      async save () {
        try {
          this.loading = true
          await this.$store.dispatch('setTable', {
            nmtable: this.nmtable,
            data: { jscontent: this.data },
          })
          this.$notifier({ content: 'Salvo com sucesso', color: 'primary', halign: 'right', valign: 'bottom' })
        } finally {
          this.loading = false
        }
      },

      async refresh () {
        this.data = await this.$store.dispatch('getTable', this.nmtable)
        if (!this.data) {
          this.data = []
          this.baseHead.forEach(bh => {
            this.data.push({
              ...bh,
              enabled: true,
              width: 'auto',
              align: 'center',
            })
          })
        }
        this.sync()
      },
    },
  }
  // Bug: salva e sai e volta na tela
</script>
