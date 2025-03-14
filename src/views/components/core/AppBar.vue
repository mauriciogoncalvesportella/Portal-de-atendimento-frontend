<template>
  <v-expand-transition>
    <v-app-bar
      v-if="tabOpens > 0 || checkMobile"
      id="app-bar"
      color="primary"
      dark
      app
      flat
      height="63"
    >
      <v-app-bar-nav-icon
        v-if="checkMobile"
        @click="setDrawer(!drawer)"
      />
      <tab
        class="mt-4"
      />
    </v-app-bar>
  </v-expand-transition>
</template>

<script>
  // Utilities
  import { mapGetters, mapState, mapMutations } from 'vuex'

  export default {
    name: 'DashboardCoreAppBar',
    components: {
      tab: () => import('@/views/component/ExampleTab.vue'),
    },
    props: {
      value: {
        type: Boolean,
        default: false,
      },
    },

    data () {
      return {
        tab: 'google',
        tabs: [
          {
            label: 'google',
            key: 'google',
          },
          {
            label: 'facebook',
            key: 'facebook',
          },
          {
            label: 'New Tab',
            key: 'costom key',
          },
        ],
      }
    },

    computed: {
      ...mapGetters(['checkMobile', 'tabItems', 'tabIndex', 'tabOpens']),
      ...mapState(['drawer']),

      tabItemName () {
        const objCont = {}
        const arrName = []
        for (const name of this.tabItems) {
          objCont[name] = objCont[name] || 0
          arrName.push(`${name}${objCont[name] === 0 ? '' : ' (' + objCont[name] + ')'}`)
          objCont[name]++
        }
        return arrName
      },

      index: {
        get () {
          return this.tabIndex
        },
        set (value) {
        },
      },
    },

    methods: {
      ...mapMutations({
        setDrawer: 'SET_DRAWER',
      }),

      closeTab (index) {
        this.$store.dispatch('closeTab', index)
      },
    },
  }
</script>
