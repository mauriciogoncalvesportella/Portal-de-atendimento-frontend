<template>
  <v-dialog
    v-model="dialog"
    :max-width="1366"
  >
    <template
      #activator="{ on }"
    >
      <v-icon
        color="primary"
        class="mr-3 ml-3"
        v-on="on"
      >
        mdi-script-text
      </v-icon>
    </template>
    <v-data-table
      :loading="loading"
      :headers="headers"
      :items="tabela"
      :hide-default-footer="true"
      :disable-pagination="true"
      fixed-header
    >
      <template #[`item.dtinicio`]="{ value }">
        {{ value | str2date }}
      </template>
      <template #[`item.dtfim`]="{ value }">
        {{ value | str2date }}
      </template>
      <template #[`item.ntotal`]="{ value }">
        <tempo-chip-color
          :sec="value"
        />
      </template>
      <template #[`item.cdticket`]="{ item, value }">
        <v-btn
          v-if="value > 0"
          small
          icon
          @click="openTheTicket({ cdticket: value, idfantasia: item.idfantasia })"
        >
          <v-icon>
            mdi-open-in-new
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-dialog>
</template>

<script>
  import { mapGetters } from 'vuex'
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad'
  import TempoChipColor from '@/views/component/TempoChipColor.vue'

  export default {
    components: {
      TempoChipColor,
    },
    extends: DependenciesLoad,
    props: {
      items: {
        type: Array,
        default: () => [],
      },
    },
    data () {
      return {
        loading: false,
        dialog: false,
        dependenciesConfig: {
          route: this.$route.name,
          executeBefore: () => { this.loading = true },
          executeAfter: this.refresh,
          dependencies: [
            { action: 'allChaves', mutation: 'SET_CHAVES' },
            { action: 'userMap', mutation: 'SET_USERMAP' },
          ],
        },
        headers: [
          { text: 'Id', value: 'cd' },
          { text: 'Pessoa', value: 'idlogin' },
          { text: 'Cliente', value: 'idfantasia' },
          { text: 'Assunto', value: 'nmassunto' },
          { text: 'Início', value: 'dtinicio' },
          { text: 'Fim', value: 'dtfim' },
          { text: 'Total', value: 'ntotal' },
          { text: 'Ticket', value: 'cdticket' },
        ],
      }
    },

    computed: {
      ...mapGetters(['chaveMap', 'userMap']),
      tabela () {
        if (!this.chaveMap) {
          return []
        }

        return this.items.map(acao => {
          return {
            cd: acao.cd,
            idlogin: this.userMap[acao._cduser].idlogin,
            idfantasia: this.chaveMap[acao.ticket.atendimento._cdchave].idfantasia,
            nmassunto: acao.nmassunto,
            dtinicio: acao.servico.dtinicio,
            dtfim: acao.servico.dtfim,
            ntotal: parseInt(acao.servico.ntotal),
            cdticket: acao._cdticket,
          }
        })
      },
    },

    methods: {
      refresh () {
        this.loading = false
      },

      async openTheTicket ({ cdticket, idfantasia }) {
        await this.$router.push({
          name: 'the-ticket',
          params: {
            cd: cdticket,
            label: `${cdticket} - ${idfantasia}`,
          },
        })
      },
    },
  }
</script>
