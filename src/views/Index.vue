<template>
  <v-app>
    <update-version v-if="$store.state.updateVersion" />
    <template v-else>
      <snackbar />
      <template
        v-if="$route.name != 'login' && token && token !== 'unauthorized'"
      >
        <dashboard-core-app-bar />
        <dashboard-core-drawer />
        <dashboard-core-settings v-if="pageLoaded" />
        <dashboard-core-today-events />
        <dashboard-socketio />
      </template>
      <dashboard-core-view />
    </template>
  </v-app>
</template>

<script>
import { mapGetters, mapState } from "vuex";
export default {
  name: "DashboardIndex",
  components: {
    Snackbar: () => import("./component/Snackbar"),
    DashboardCoreAppBar: () => import("./components/core/AppBar"),
    DashboardCoreDrawer: () => import("./components/core/Drawer"),
    DashboardCoreView: () => import("./components/core/View"),
    DashboardCoreSettings: () => import("./components/core/Settings"),
    DashboardCoreTodayEvents: () => import("./components/core/TodayEvents"),
    DashboardSocketio: () => import("./components/core/Socketio.vue"),
    UpdateVersion: () => import("./components/core/VersionUpdate.vue"),
  },

  data: () => ({
    pageLoaded: false,
    expandOnHover: false,
  }),

  computed: {
    ...mapGetters(["isDashboard"]),
    ...mapState("Tema", ["colorTheme"]),
    token: function () {
      return this.$store.getters.token;
    },
  },

  created() {
    window.addEventListener("resize", this.windowResize);
    this.$vuetify.theme.themes.light.primary = this.colorTheme;
  },

  mounted() {
    window.addEventListener("load", () => {
      this.pageLoaded = true;
    });
  },

  methods: {
    windowResize(event) {
      this.$store.dispatch("screenResize", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    },
  },
};
</script>

<style lang="sass">
/* width */
::-webkit-scrollbar
  width: 8px
  height: 8px

/* Track */
::-webkit-scrollbar-track
  background: #f1f1f1

/* Handle */
::-webkit-scrollbar-thumb
  background: #888
  border-radius: 25px

/* Handle on hover */
::-webkit-scrollbar-thumb:hover
  background: var(--v-primary-base)
  border-radius: 25px
</style>
