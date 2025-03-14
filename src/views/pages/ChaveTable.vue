<template>
  <v-row
    no-gutters
    class="fill-height"
  >
    <v-col
      cols="12"
      md="4"
      class="d-flex"
    >
      <v-text-field
        v-model="search"
        label="Pesquisar"
        hide-details="auto"
        append-icon="mdi-magnify"
        filled
        dense
      />
    </v-col>
    <v-col
      ref="container"
      cols="12"
      class="mt-2"
    >
      <v-data-table
        ref="table"
        v-resize="resizeTable"
        fixed-header
        :headers="baseHead"
        :items="tabela"
        :search="search"
        :loading="loadingTable"
        :single-expand="true"
        :expanded.sync="expanded"
        :no-data-text="textTableEmpty"
        :no-results-text="textTableEmpty"
        item-key="cd"
        :footer-props="{ 'items-per-page-options':[10, 30, 50, 100], 'items-per-page-text': 'Registros por página' }"
        show-expand
      >
        <template #[`item.dtatualizacao`]="{ value }">
          <span v-if="value"> {{ normalizaData(value) }} </span>
        </template>

        <template #[`item.dtvalidade`]="{ item, value }">
          <v-tooltip
            v-if="value"
            left
          >
            <template
              #activator="{ on }"
            >
              <v-chip
                :color="corData(value)"
                style="cursor: pointer"
                v-on="on"
                @click="updateDtValidade(item.cd)"
              >
                <v-progress-circular
                  v-if="loadingDtvalidade === item.cd"
                  width="1.5"
                  size="14"
                  class="mx-7"
                  indeterminate
                />
                <span
                  v-else
                >
                  {{ value ? normalizaData(value) : "" }}
                </span>
              </v-chip>
            </template>

            <span v-if="subData(value) > 0">
              expira em {{ subData(value) }} dia(s)
            </span>

            <span v-else-if="subData(value) < 0">
              expirou há {{ -subData(value) }} dia(s)
            </span>

            <span v-else>
              expirou hoje
            </span>
          </v-tooltip>
        </template>

        <template #[`item.idfantasia`]="{ value }">
          <span
            class="d-inline-block text-truncate text-left"
          >
            {{ value }}
          </span>
          <!--v-tooltip
            v-if="value.length > headInfo.idfantasia.width"
            bottom
          >
            <template v-slot:activator="{ on }">
              <span v-on="on"> {{ value | cut(headInfo.idfantasia.width) }} </span>
            </template>
            <span>{{ value }}</span>
          </v-tooltip>
          <span v-else> {{ value }} </span-->
        </template>

        <template #[`item.nmrazao`]="{ value }">
          <v-tooltip
            v-if="value.length > 15"
            bottom
          >
            <template #activator="{ on }">
              <span v-on="on"> {{ value | cut }} </span>
            </template>
            <span>{{ value }}</span>
          </v-tooltip>
          <span v-else> {{ value }} </span>
        </template>

        <template #[`item.action`]="{ item }">
          <v-icon
            small
            class="mr-2"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
        </template>

        <template #expanded-item="{ headers, item }">
          <td
            :colspan="headers.length"
            style="background-color: rgba(0, 0, 0, 0);"
            class="text-center"
          >
            <v-chip label>
              {{ item.dschave | cut(50) }}
              <v-btn
                text
                icon
                color="black"
              >
                <v-icon
                  size="17"
                  @click="textToClipboard(item.dschave)"
                >
                  mdi-content-copy
                </v-icon>
              </v-btn>
            </v-chip>
          </td>
        </template>
      </v-data-table>
    </v-col>

    <v-dialog
      v-model="dialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span
            class="text-h5"
          >
            {{ itemEditado.idfantasia }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="itemEditado.cdsistema"
                  label="Cod. Sistema"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="itemEditado.nrcontrole"
                  label="Número Controle"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="itemEditado.nrempresas"
                  label="Número Empresas"
                />
              </v-col>
              <v-col cols="12">
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :return-value.sync="itemEditado.dtvalidade"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ on }">
                    <v-text-field
                      v-model="itemEditado.dtvalidade"
                      type="date"
                      label="Data Validade"
                      readonly
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="itemEditado.dtvalidade"
                    locale="br"
                    no-title
                    scrollable
                  >
                    <v-spacer />
                    <v-btn
                      text
                      color="primary"
                      @click="menu = false"
                    >
                      Cancelar
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.menu.save(itemEditado.dtvalidade)"
                    >
                      Salvar
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="itemEditado.dschave"
                  label="Chave"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey darken-1"
            text
            @click="dialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="green darken-1"
            text
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
  import API from '@/api/'
  export default {
    components: {
      // TableConfig: () => import('../component/TableConfig.vue'),
    },

    data () {
      return {
        tableHeight: '40vh',
        width: '100%',
        textTableEmpty: 'Não há registros',
        loadingTable: false,
        menu: false,
        dialog: false,
        expanded: [],
        token: '',
        settings: [],
        snackText: '',
        snackColor: 'red lighten-1',
        snackbar: false,
        search: '',
        baseHead: [
          { text: 'Cliente', value: 'cdcliente' },
          { text: 'CNPJ', value: 'idcnpj' },
          { text: 'N. Fantasia', value: 'idfantasia', align: 'start' },
          // { text: 'R. Social', value: 'nmrazao' },
          // { text: 'Sistema', value: 'cdsistema' },
          // { text: 'Controle', value: 'nrcontrole' },
          // { text: 'Usuarios', value: 'nrusuarios' },
          // { text: 'Empresas', value: 'nrempresas' },
          { text: 'Validade', value: 'dtvalidade' },
          { text: 'Exe', value: 'idversaoexe' },
          { text: 'Db', value: 'idversaodb' },
          { text: 'Atualização', value: 'dtatualizacao' },
          // { text: 'Editar', value: 'action', sortable: fals' },
          { text: 'Chave', value: 'data-table-expand' },
        ],
        headInfo: {},
        loadingDtvalidade: -1,
        itemEditado: {},
        tabela: [],
      }
    },

    mounted () {
      this.getTableData()
      this.resizeTable()
    },

    methods: {
      async resizeTable () {
        await new Promise(resolve => setTimeout(() => {
          this.tableHeight = `${this.$refs.container?.clientHeight - 130}px` || '80vh'
        }, 10))
      },

      corData (data) {
        if (data) {
          const dias = this.subData(data)
          if (dias <= 0) return 'red lighten-1'
          if (dias <= 5) return 'orange lighten-3'
          return 'green lighten-3'
        }
        return 'green'
      },

      editItem (item) {
        this.itemEditado = Object.assign({}, item)
        const dt = (new Date(this.itemEditado.dtvalidade)).toISOString().split('T')[0]
        this.itemEditado.dtvalidade = dt
        this.dialog = true
      },

      async getTableData () {
        this.loadingTable = true
        try {
          this.tabela = await this.$store.dispatch('allChaves')
        } finally {
          this.loadingTable = false
        }
      },

      async updateDtValidade (cdchave) {
        const tableItem = this.tabela.find(item => item.cd === cdchave)
        if (tableItem) {
          if (new Date(tableItem.dtvalidade) <= new Date()) {
            const res = await this.$confirm(
              'Data de validade será acrescida um dia',
              {
                title: 'Aviso',
                buttonTrueText: 'Confirmar',
                buttonFalseText: 'Cancelar',
              },
            )

            if (res) {
              try {
                this.loadingDtvalidade = cdchave
                const { dtvalidade } = await API.Chave.updateDtvalidade({ cdchave, days: 1 })
                tableItem.dtvalidade = dtvalidade
              } finally {
                this.loadingDtvalidade = -1
              }
            }
          }
        }
      },
    },
  }
</script>

<style>
  .resizable-content {
    width: "100%";
    height: "100%";
    color: "red",
  }
</style>
