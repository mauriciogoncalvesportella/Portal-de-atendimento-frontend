<template>
  <v-container
    id="atendimento"
    fluid
  >
    <v-row
      dense
    >
      <v-col
        cols="12"
        md="3"
        xl="2"
      >
        <novo-atendimento-modal />
        <v-hover
          v-slot:default="{ hover }"
          class="mt-1 d-none d-inline-sm"
        >
          <v-card
            v-ripple="{ center: true }"
            :elevation="hover ? 5 : 1"
            dark
            color="teal"
            style="cursor: pointer;"
            @click="refresh(true)"
          >
            <v-card-text
              class="subtitle text-center"
            >
              <v-icon
                size="30"
              >
                mdi-refresh
              </v-icon>
              Atualizar
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
      <v-col
        cols="6"
        md="3"
        xl="2"
      >
        <v-card
          light
        >
          <v-card-title
            class="body-2"
            style="text-color: white"
          >
            <v-icon class="mr-2">
              mdi-clock
            </v-icon>
            Tempo de suporte
            <v-spacer />
            <v-btn
              icon
              x-small
              :loading="loading"
              :disabled="!loading"
            />
          </v-card-title>
          <v-divider />
          <v-card-text
            class="subtitle text-center display-3 pa-3"
          >
            {{ tempo|sec2date }}
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="6"
        md="3"
        xl="2"
      >
        <v-card
          light
        >
          <v-card-title class="body-2">
            <v-icon class="mr-md-2">
              mdi-chart-bar-stacked
            </v-icon>
            Atendimentos
            <v-spacer />
            <v-btn
              icon
              x-small
              :loading="loading"
              :disabled="!loading"
            />
          </v-card-title>
          <v-divider />
          <v-card-text
            class="subtitle text-center display-3 pa-3"
          >
            {{ atendimentos }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row
      dense
      no-gutters
      class="mt-5"
    >
      <v-col
        cols="12"
        class="ma-0 mb-10 pa-0"
      >
        <v-card>
          <v-card-title class="display-1 teal dark">
            <span style="color: white"> Tabela de atendimentos </span>
          </v-card-title>
          <v-divider />
          <v-data-table
            id="my-table"
            :headers="headers"
            :items="items"
            :dense="false"
            :loading="loading"
            item-key="items.cd"
            sort-by="dtinicio"
            no-data-text="Não há atendimentos"
            no-results-text="Não há atendimentos"
            :footer-props="{ 'items-per-page-options':[10, 30, 50, 100, -1], 'items-per-page-text': 'Registros por página' }"
          >
            <template v-slot:item.uuid="{ item }">
              <v-btn
                text
                color="primary"
                @click="openTab(item)"
              >
                <v-icon
                  left
                >
                  mdi-open-in-new
                </v-icon>
                {{ item.uuid }}
              </v-btn>
            </template>

            <template v-slot:item.dtinicio="{ item }">
              {{ item.dtinicio | str2date }}
            </template>

            <template v-slot:item.icon="{ value }">
              <v-icon> {{ value }} </v-icon>
            </template>

            <template v-slot:item.dtstatus="{ item }">
              <!--v-chip
                :color="chipColor(item.dtstatus)"
                :dark="chipColor(item.dtstatus) == 'red' ? true : false"
              >
                {{ item.dtstatus | sec2date }}
              </v-chip-->
              <tempo-chip-color
                :sec="item.dtstatus"
              />
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                @click="done(item.cd)"
              >
                <v-icon color="green">
                  mdi-check-outline
                </v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import NovoAtendimentoModal from '@/views/component/NovoAtendimentoModal.vue'
  import TempoChipColor from '@/views/component/TempoChipColor.vue'

  export default {
    name: 'DashboardAtendimento',
    components: {
      NovoAtendimentoModal,
      TempoChipColor,
    },
    data () {
      return {
        tempo: 0,
        serverTime: 0,
        atendimentos: '...',
        loading: false,
        interval: null,
        search: '',
        data: [],
        headers: [
          { text: 'Id', value: 'uuid' },
          { text: 'Cliente', value: 'chave.idfantasia' },
          { text: 'Origem', value: 'icon' },
          { text: 'Início em', value: 'dtinicio' },
          { text: 'Tempo', value: 'dtstatus' },
          { text: 'Concluir', value: 'actions', sortable: false },
        ],
      }
    },

    computed: {
      items () {
        if (this.data) {
          return this.data.filter(item => item.dtfim == null)
        }
        return []
      },
    },

    mounted () {
      this.refresh(false)
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'SET_ATENDIMENTO') {
          this.refresh(false)
        }
      })

      this.interval = setInterval(() => {
        this.serverTime += 1000
        if (this.items.length > 0) {
          this.tempo += 1000
        }

        this.data = this.data.map(da => {
          return {
            ...da,
            dtstatus: da.dtstatus + 1000,
          }
        })
      }, 1000)
    },

    destroyed () {
      clearInterval(this.interval)
    },

    methods: {
      chipColor (t) {
        const min = t / (1000 * 60)
        if (min > 15) {
          return 'red'
        } else if (min > 10) {
          return 'orange'
        }
        return ''
      },

      async refresh (force) {
        try {
          this.loading = true
          this.serverTime = await this.$store.dispatch('getServerTime')
          this.data = await this.$store.dispatch('allAtendimentos', force)
          this.atendimentos = this.data.length
          this.data = this.data?.map(da => {
            const dtinicio = new Date(da.dtinicio)
            const dtstatus = this.serverTime - dtinicio.getTime()
            return {
              ...da,
              tab: `NovoAtendimento-${da.uuid}`,
              dtinicio: dtinicio,
              dtstatus: dtstatus,
              icon: da.origem.idicon,
            }
          })
          this.calcTempoSuporte()
        } finally {
          this.loading = false
        }
      },

      async done (cd) {
        try {
          this.loading = true
          await this.$store.dispatch('doneAtendimento', { cd })
        } finally {
          this.loading = false
        }
      },

      calcTempoSuporte () {
        if (this.data) {
          let vet = this.data.map(d => {
            const dtfim = (!d.dtfim) ? this.serverTime : new Date(d.dtfim).getTime()
            return {
              cd: d.cd,
              dtinicio: new Date(d.dtinicio).getTime(),
              dtfim: dtfim,
            }
          })

          vet.sort((a, b) => a.dtinicio - b.dtinicio)
          let time = 0

          for (let i = 0; i < vet.length; i++) {
            const daVez = vet[i]
            if (!daVez.inutil) {
              time += daVez.dtfim - daVez.dtinicio
              vet = vet.map((it) => {
                let inutil = false
                if (daVez.dtfim >= it.dtfim) {
                  inutil = true
                } else if (daVez.dtfim > it.dtinicio) {
                  it.dtinicio = daVez.dtfim
                }

                return {
                  cd: it.cd,
                  dtinicio: it.dtinicio,
                  dtfim: it.dtfim,
                  inutil: inutil,
                }
              })
            }
          }

          this.tempo = time
          return time
        }
        return 0
      },

      async openTab (item) {
        /*
        await this.$router.push({
          name: 'ticket-online',
          params: {
            cdatendimento: item.cd,
          },
        })
        */
      },
    },
  }
</script>
