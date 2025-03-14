<template>
  <v-container
    id="admin-atendimento"
    class="mb-10"
    fluid
  >
    <atendimento-filter
      v-model="filter"
      @send="send"
    />

    <v-loading-table
      v-if="loading"
      class="ma-md-5"
      :rows="5"
      :columns="8"
    />

    <v-data-table
      v-else-if="showTable"
      :headers="head"
      :items="items"
      class="mt-4"
      fixed-header
      loading-text="Carregando"
      :loading="loading"
      :no-data-text="noDataText"
      :footer-props="{ 'items-per-page-options': [25, 50, 100, -1], 'items-per-page-text': 'Registros por página' }"
    >
      <template #[`item.idfantasia`]="{ value }">
        {{ value }}
      </template>

      <template #[`item.origem`]="{ value }">
        <v-icon> {{ value.idicon }}  </v-icon>
      </template>
      <template #[`item.dtinicio`]="{ item }">
        {{ item.dtinicio | str2date }}
      </template>

      <template #[`item.dtfim`]="{ item }">
        <span v-if="item.dtfim"> {{ item.dtfim | str2date }} </span>
        <span v-else> ... </span>
      </template>

      <template #[`item.tempo`]="{ item }">
        {{ item.tempo | sec2date }}
      </template>

      <template #[`item.edit`]="{ item }">
        <atendimento-pop-over
          :item="item"
          @done="send"
        />
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
  export default {
    name: 'AdminAtendimento',
    components: {
      AtendimentoPopOver: () => import('../component/BaseAtendimentoPopOver.vue'),
      AtendimentoFilter: () => import('../component/BaseAtendimentoFilter.vue'),
    },

    data () {
      return {
        showTable: false,
        filter: null,
        loading: false,
        userList: [],
        dialog: false,
        head: [
          { text: 'Pessoa', value: 'user.idlogin' },
          { text: 'Cliente', value: 'chave.idfantasia' },
          { text: 'Origem', value: 'origem' },
          { text: 'Data', value: 'date' },
          { text: 'Início', value: 'dtinicio' },
          { text: 'Fim', value: 'dtfim' },
          { text: 'Total', value: 'tempo' },
          { text: 'Modificar', value: 'edit' },
        ],
        clientes: [],
        users: [],
        items: [],
        times: null,
        noDataText: 'Vazio',
      }
    },

    computed: {
      computedDateFormatted () {
        return this.formatDate(this.dtinicio)
      },
    },

    methods: {
      async transform (data) {
        const serverTime = await this.$store.dispatch('getServerTime')
        this.items = data.map(it => {
          const dtinicio = (new Date(it.dtinicio)).getTime()
          const date = (new Date(it.dtinicio)).toLocaleDateString()
          const dtfim = (it.dtfim) ? (new Date(it.dtfim)).getTime() : serverTime
          return {
            ...it,
            date,
            tempo: dtfim - dtinicio,
            edit: true,
          }
        })
      },

      async send () {
        try {
          this.loading = true
          const data = await this.$store.dispatch('allAtendimentosAdmin', this.filter)
          if (data.length === 0) {
            this.noDataText = 'Nenhum item encontrado'
          }
          await this.transform(data)
          this.showTable = true
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>
