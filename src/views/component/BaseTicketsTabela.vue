<template>
  <v-container
    fluid
  >
    <v-row
      dense
      align="center"
      class="mb-1"
    >
      <v-col>
        <v-text-field
          v-model="searchText"
          label="Pesquisar"
          hide-details="auto"
          filled
        />
      </v-col>
      <v-col>
        <v-menu
          ref="menu"
          v-model="menuDate"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              label="Selecione a data"
              prepend-inner-icon="mdi-calendar"
              readonly
              filled
              hide-details="auto"
              :value="dateText"
              v-bind="attrs"
              v-on="on"
            />
          </template>
          <v-date-picker
            v-model="date"
            no-title
            range
            scrollable
            locale="pt-BR"
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
              @click="$refs.menu.save(date)"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col>
        <cliente-selector
          ref="clienteSelector"
          v-model="chaves"
          filled
          class="ma-0"
          :dense="false"
        />
      </v-col>
      <v-col
        class="flex-shrink-1 flex-grow-0"
      >
        <v-menu
          v-model="menu"
          bottom
          style="opacity: 1!important"
        >
          <template #activator="{ on, attrs }">
            <v-btn
              icon
              label
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>
                mdi-filter
              </v-icon>
            </v-btn>
          </template>
          <tickets-filter-tree
            ref="ticketsFilterTree"
            v-model="treeFilter"
          />
        </v-menu>
      </v-col>
      <v-col
        class="d-flex justify-end"
      >
        <v-btn
          depressed
          tile
          class="mr-2"
          @click="clearFilter"
        >
          Limpar
        </v-btn>
        <v-btn
          depressed
          dark
          tile
          color="primary"
          @click="refresh()"
        >
          <v-icon
            left
          >
            mdi-magnify
          </v-icon>
          Buscar
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      id="myTable"
      :page="page"
      :headers="headers"
      :items="items"
      :options.sync="options"
      :server-items-length="totalItems"
      :loading="loading"
      :footer-props="{ 'items-per-page-options':[10, 30, 50, 100], 'items-per-page-text': 'Registros por página' }"
      :search="searchText"
      class="elevation-1"
      fixed-header
      @update:page="refresh"
      @update:sort-by="refresh"
      @update:sort-desc="refresh"
      @update:items-per-page="refresh"
    >
      <template
        #top
      >
        <div
          class="d-flex justify-end"
        >
          <v-btn
            tile
            small
            color="primary"
            @click="downloadCSV()"
          >
            <v-icon
              left
            >
              mdi-download
            </v-icon>
            download Excel
            <v-icon
              right
            >
              mdi-microsoft-excel
            </v-icon>
          </v-btn>
        </div>
      </template>
      <template #[`item.dtcriacao`]="{ value }">
        {{ value }}
      </template>
      <template #[`item.fgticket`]="{ item }">
        <v-icon>
          {{ item.fgarquivado ? 'mdi-folder-lock' : 'mdi-folder-lock-open' }}
        </v-icon>
      </template>
      <template #[`item.abrir`]="{ item }">
        <v-btn
          small
          icon
          @click="openTheTicket(item)"
        >
          <v-icon>
            mdi-open-in-new
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.users`]="{ item }">
        <user-initials-avatar
          v-for="usercd in ticketUserMap[item.cd]"
          :key="`user-initals-avatar-${usercd}`"
          :cduser="usercd"
          class="ml-1"
          :color="item.cdresponsavel == usercd ? 'primary' : 'grey darken-2'"
        />
      </template>

      <template #[`item.fgarquivado`]="{ value }">
        {{ value ? 'sim' : 'não' }}
      </template>

      <!--template v-slot:item.acoes="{ value }">
        <acoes-pop-over
          :acoes="value"
        />
      </template-->
    </v-data-table>
  </v-container>
</template>

<script>
  import UserInitialsAvatar from '@/views/component/BaseUserInitialsAvatar'
  import TicketsFilterTree from '@/views/component/BaseTicketsFilterTree'
  import { mapGetters } from 'vuex'
  import ClienteSelector from '@/views/component/BaseClientesSelector'
  import { omitBy, isNil } from 'lodash'
  // import AcoesPopOver from '@/views/component/BaseAcoesPopOver'

  export default {
    components: {
      TicketsFilterTree,
      UserInitialsAvatar,
      ClienteSelector,
      // AcoesPopOver,
    },
    data () {
      return {
        menuDate: false,
        treeFilter: {},
        searchText: '',
        chaves: [],
        searchText1: '',
        tableHeight: '100%',
        numberOfPages: 0,
        firstLoad: false,
        page: 1,
        totalItems: 0,
        loading: false,
        options: {},
        userMap: {},
        ticketUserMap: {},
        chaveMap: {},
        situacaoMap: {},
        headers: [
          { text: 'id', value: 'cd' },
          { text: 'Tipo', value: 'fgticket', sortable: false },
          { text: 'Iniciado por', value: 'idlogin', sortable: false },
          { text: 'Cliente', value: 'idfantasia', sortable: false },
          { text: 'Dt. Criação', value: 'dtcriacao' },
          { text: 'Pessoas', value: 'users', sortable: false },
          { text: 'Motivo', value: 'nmmotivo', sortable: false },
          { text: 'Assunto', value: 'nmassunto', sortable: false },
          { text: 'Urgencia', value: 'nmurgencia' },
          { text: 'Situação', value: 'nmsituacao', sortable: false },
          // { text: 'Ações', value: 'acoes', class: 'text-right', sortable: false },
          { text: 'Abrir', value: 'abrir', sortable: false },
        ],
        date: null,
        menu: true,
        users: [],
        items: [],
        lastFilter: null,
      }
    },
    computed: {
      ...mapGetters(['screen']),
      filter () {
        const options = this.options
        if (this.searchText) {
          options.searchPattern = this.searchText
        } else {
          options.searchPattern = null
        }
        const date = this.date ?? []
        return omitBy({
          ...this.treeFilter,
          chaves: this.chaves?.length ? this.chaves : undefined,
          dt0: date[0],
          dt1: date[1],
          options,
        }, isNil)
      },
      dateText () {
        if (!this.date || !this.date[0]) {
          return ''
        }
        const dt0 = this.$moment(this.date[0]).format('DD/MM/yyyy')
        let dt1
        if (!this.date[1] || this.date[0] === this.date[1]) {
          dt1 = null
        } else {
          dt1 = this.$moment(this.date[1]).format('DD/MM/yyyy')
        }
        if (dt0 && dt1) {
          return `${dt0} - ${dt1}`
        }
        return dt0
      },
    },

    mounted () {
      this.menu = false
      this.start()
    },

    methods: {
      async clearFilter () {
        // this.treeFilter = {}
        this.searchText = ''
        this.$refs.clienteSelector.newValue([])
        this.chaves = []
        await this.$refs.ticketsFilterTree.refresh()
        // this.chaves = []
        this.date = null
      },

      async start () {
        this.loading = true
        try {
          this.userMap = await this.$store.dispatch('userMap', { force: false, mutex: false })
          this.motivoMap = await this.$store.dispatch('motivoMap')
          this.situacaoMap = await this.$store.dispatch('situacaoMap')
          this.urgenciaMap = await this.$store.dispatch('urgenciaMap')
          await this.$store.dispatch('allChaves')
          this.chaveMap = this.$store.getters.chaveMap
          this.loading = false
          await this.refresh()
        } catch (err) {
          // console.error(err)
        } finally {
          this.loading = false
        }
      },

      async refresh () {
        this.loading = true
        try {
          if (this.filter.date === '') {
            this.filter.date = null
          }
          const [items, totalItems] = await this.$store.dispatch('allTicketsFilterPaginate', this.filter)
          const cdticketArray = items.map(curr => curr.cd)
          if (cdticketArray.length > 0) {
            this.ticketUserMap = await this.$store.dispatch('ticketUserMap', { cdticketArray, force: false, mutex: false })
          }
          this.items = items.map(curr => {
            return {
              cd: curr.cd,
              fgticket: curr.fgticket ? 'Interno' : 'Público',
              idlogin: this.userMap[curr.atendimento._cduser].idlogin,
              users: curr.users,
              nmmotivo: this.motivoMap[curr.atendimento._cdmotivo].nmmotivo,
              nmurgencia: this.urgenciaMap[curr._cdurgencia]?.nmurgencia || '',
              nmsituacao: this.situacaoMap[curr._cdsituacao].nmsituacao,
              idfantasia: this.chaveMap[curr.atendimento._cdchave].idfantasia,
              fgarquivado: curr.fgarquivado,
              nmassunto: curr.nmtitulo,
              // nmassunto: curr.acoes[0]?.nmassunto ?? '',
              cdresponsavel: curr._cdresponsavel,
              // acoes: curr.acoes,
              dtcriacao: this.$moment(curr.dtcriacao).format('DD/MM/YYYY HH:mm:ss'),
            }
          })
          this.totalItems = totalItems
        } catch (err) {
          // console.error(err)
        } finally {
          this.loading = false
        }
      },

      async openTheTicket (atendimento) {
        await this.$router.push({
          name: 'the-ticket',
          params: {
            cd: atendimento.cd,
            label: `${atendimento.cd} - ${atendimento.idfantasia}`,
          },
        })
      },

      async downloadCSV () {
        const url = process.env.VUE_APP_BACKEND_URL
        const token = this.$store.getters.token
        const stringFilter = encodeURIComponent(JSON.stringify(this.filter))
        window.open(`${url}/files/tickets-csv?token=${token}&filter=${stringFilter}`, '_blank')
      },
    },
  }
</script>
<style scoped>
  .tr {
      background-color: black !important;
      border-bottom: none !important;
   }
</style>
