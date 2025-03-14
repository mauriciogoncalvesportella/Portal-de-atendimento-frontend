<template>
  <v-row
    class="fill-height mt-lg-1"
    justify="center"
    no-gutters
  >
    <v-col
      cols="12"
      md="10"
      lg="8"
    >
      <v-row
        dense
      >
        <v-col
          cols="12"
        >
          <v-tabs
            v-model="model"
            background-color="rgba(0, 0, 0, 0)"
            icons-and-text
          >
            <v-tab
              v-for="(tab, i) in tabs"
              :key="`tab-${i}`"
              :to="tab.to"
            >
              {{ tab.title }}
              <v-icon>
                {{ tab.icon }}
              </v-icon>
            </v-tab>
          </v-tabs>
        </v-col>
        <v-col
          cols="12"
        >
          <v-divider />
        </v-col>
        <v-col
          cols="12"
        >
          <v-sheet
            height="100%"
            color="rgba(0, 0, 0, 0)"
          >
            <keep-alive>
              <component
                :is="component"
                ref="component"
                @loading="componentLoading = $event"
              />
            </keep-alive>
          </v-sheet>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
  import FilaEsperaTable from './FilaEsperaTable'
  import FilaEsperaHistory from './FilaEsperaHistory'

  export default {
    components: {
      NovoFilaEspera: () => import('../component/BaseFilaEsperaDialog.vue'),
    },

    props: {
      props: {
        type: Object,
        default: () => ({
          id: 'queue',
        }),
      },
    },

    data: () => ({
      model: 0,
      tabs: [
        {
          id: 'queue',
          title: 'Fila',
          icon: 'mdi-human-queue',
          canReload: true,
          to: '/dashboard/fila-espera/queue',
          component: FilaEsperaTable,
        },
        {
          id: 'history',
          title: 'Histórico',
          icon: 'mdi-database',
          canReload: false,
          to: '/dashboard/fila-espera/history',
          component: FilaEsperaHistory,
        },
      ],
    }),

    computed: {
      component () {
        const tab = this.tabs.find(tab => tab.id === this.props?.id)
        return tab?.component
      },
    },
  }
</script>
