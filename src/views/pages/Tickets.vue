<template>
  <v-row
    align="start"
    class="fill-height"
    align-content="start"
    no-gutters
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
        <v-spacer />
        <v-btn
          v-if="canReload"
          color="primary"
          tile
          depressed
          class="my-auto mr-2"
          :disabled="componentLoading"
          @click="refreshComponent"
        >
          <v-icon
            left
          >
            mdi-refresh
          </v-icon>
          Recarregar
        </v-btn>
      </v-tabs>
    </v-col>
    <v-col
      cols="12"
      class="mt-2 mb-1"
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
        <component
          :is="component"
          ref="component"
          @loading="componentLoading = $event"
        />
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
  import TicketsKanban from '@/views/component/BaseTicketsKanban'
  import BaseTicketsTabela from '@/views/component/BaseTicketsTabela'

  export default {
    name: 'Tickets',
    props: {
      props: {
        type: Object,
        default: () => {
          return {
            id: 'kanban',
          }
        },
      },
    },
    data () {
      return {
        model: 0,
        tabIndex: null,
        componentLoading: false,
        tabs: [
          {
            id: 'kanban',
            title: 'Kanban',
            icon: 'mdi-cards',
            canReload: true,
            to: '/dashboard/tickets/kanban',
            component: TicketsKanban,
          },
          {
            id: 'list',
            title: 'Lista',
            icon: 'mdi-view-list',
            canReload: false,
            to: '/dashboard/tickets/list',
            component: BaseTicketsTabela,
          },
        ],
      }
    },

    computed: {
      component () {
        const tab = this.tabs.find(tab => tab.id === this.props?.id)
        return tab?.component
      },

      canReload () {
        return this.component?.canReload ?? false
      },
    },

    methods: {
      refreshComponent () {
        if (this.$refs.component?.refresh) {
          this.$refs.component.refresh()
        }
      },
    },
  }
</script>
