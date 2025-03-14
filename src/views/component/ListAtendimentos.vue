<template>
  <v-container
    id="lista-atendimentos"
    fluid
  >
    <v-dialog
      v-model="dialog"
      :max-width="1366"
    >
      <template
        #activator="{ on }"
      >
        <v-icon
          color="primary"
          v-on="on"
        >
          mdi-eye
        </v-icon>
      </template>
      <v-data-table
        :loading="loading"
        :headers="head"
        :items="itemsMap"
        :hide-default-footer="true"
        :disable-pagination="true"
        fixed-header
        height="80vh"
      >
        <template #[`item.idfantasia`]="{ value }">
          {{ value }}
        </template>

        <template #[`item.origem`]="{ value }">
          <v-icon> {{ value.idicon }} </v-icon>
        </template>

        <template #[`item.nmmotivo`]="{ value }">
          <span
            v-if="value"
          >
            {{ value }}
          </span>
          <v-sheet
            v-else
            class="d-flex justify-center"
            color="rgba(0, 0, 0, 0)"
          >
            <v-icon>
              mdi-timer-sand
            </v-icon>
          </v-sheet>
        </template>

        <template #[`item.dtinicio`]="{ value }">
          {{ value | str2date }}
        </template>

        <template #[`item.dtfim`]="{ item }">
          <span v-if="item.dtfim"> {{ item.dtfim | str2date }} </span>
          <v-sheet
            v-else
            class="d-flex justify-center"
            color="rgba(0, 0, 0, 0)"
          >
            <v-icon>
              mdi-timer-sand
            </v-icon>
          </v-sheet>
        </template>

        <template #[`item.tempoTotal`]="{ value }">
          <tempo-chip-color :sec="value" />
        </template>

        <template #[`item.edit`]="{ item }">
          <atendimento-pop-over
            :item="item"
            @done="$emit('done')"
          />
        </template>

        <template #[`item.destroy`]="{ item }">
          <v-btn
            icon
            :loading="loadingDestroy"
            color="red"
            @click="destroyAtendimento(item.cd)"
          >
            <v-icon>
              mdi-delete
            </v-icon>
          </v-btn>
        </template>

        <template #[`item._cdticket`]="{ value, item }">
          <v-btn
            v-if="value != null"
            small
            icon
            @click="openTheTicket({ cdticket: value, idfantasia: item.chave.idfantasia })"
          >
            <v-icon>
              mdi-open-in-new
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-dialog>
  </v-container>
</template>

<script>
  import TempoChipColor from '@/views/component/TempoChipColor.vue'
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad.vue'
  import { mapGetters } from 'vuex'

  export default {
    name: 'ListaAtendimentos',
    components: {
      AtendimentoPopOver: () => import('../component/BaseAtendimentoPopOver.vue'),
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
        loadingDestroy: false,
        loading: false,
        dialog: false,
        dependenciesConfig: {
          route: this.$route.name,
          executeBefore: () => { this.loading = true },
          executeAfter: this.refresh,
          dependencies: [{ action: 'userMap', mutation: 'SET_USERMAP' }],
        },
        head: [
          { text: 'Id', value: 'cd' },
          { text: 'Pessoa', value: 'idlogin' },
          { text: 'Cliente', value: 'idfantasia' },
          { text: 'Origem', value: 'origem' },
          { text: 'Motivo', value: 'nmmotivo' },
          { text: 'Início', value: 'dtinicio' },
          { text: 'Fim', value: 'dtfim' },
          { text: 'Total', value: 'tempoTotal' },
        ],
        itemsMap: [],
      }
    },
    computed: {
      ...mapGetters(['userMap']),
    },
    watch: {
      dialog (value) {
        this.$emit('change-modal', value)
      },
    },
    methods: {
      refresh () {
        try {
          this.itensMap = []
          if (this.$checkRole('atendimento.others.rewrite')) {
            this.head.push({ text: 'Editar', value: 'edit' })
            this.head.push({ text: 'Excluir', value: 'destroy' })
          }
          this.head.push({ text: 'Abrir', value: '_cdticket' })
          this.itemsMap = this.items.map(it => {
            return {
              ...it,
              nmmotivo: it.motivo.nmmotivo,
              idfantasia: it.chave.idfantasia,
              idlogin: this.userMap[it._cduser].idlogin,
            }
          })
        } finally {
          this.loading = false
        }
      },

      async destroyAtendimento (cd) {
        try {
          this.loadingDestroy = true
          const res = await this.$confirm(
            'Ticket vinculado ao atendimento também será excluido, você deseja excluir?',
            {
              title: 'Aviso',
              buttonTrueText: 'Sim',
              buttonFalseText: 'Cancelar',
            },
          )
          if (res) {
            await this.$store.dispatch('destroyAtendimento', cd)
            this.$emit('done')
          }
        } finally {
          this.loadingDestroy = false
        }
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
