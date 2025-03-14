<template>
  <v-main
    class="grey lighten-4"
  >
    <v-container
      v-if="isDashboard"
      fluid
    >
      <template
        v-if="tabOpens > 0"
      >
        <keep-alive
          v-for="tab in tabContents"
          :key="tab.id"
        >
          <component
            :is="tab.id"
            v-if="tabIndexId == tab.id"
            :ref="tab.id"
            :props="tab.props"
            :component-id="tab.id"
          />
        </keep-alive>
      </template>
      <blank
        v-else
      />
    </v-container>
    <router-view v-else />
    <dashboard-core-footer />
  </v-main>
</template>

<script>
  import {
    mapGetters,
  } from 'vuex'

  export default {
    name: 'DashboardCoreView',
    components: {
      DashboardCoreFooter: () => import('./Footer'),
      Blank: () => import('../../pages/Menu.vue'),
    },

    computed: {
      ...mapGetters(['tabOpens', 'tabContents', 'tabIndexId', 'isDashboard']),
    },
  }
</script>
