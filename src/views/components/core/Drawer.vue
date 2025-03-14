<template>
  <v-navigation-drawer
    id="core-navigation-drawer"
    :key="refreshKey"
    v-model="drawer"
    app
    mobile-breakpoint="1280"
    overlay-color="primary"
    :expand-on-hover="!checkMobile"
    :mini-variant="!checkMobile"
  >
    <v-list
      :id="idIncrementTxt"
      dense
      nav
      class="py-0 mt-3"
      active-class="border"
    >
      <v-list-item-group>
        <template v-for="item in items">
          <v-list-item
            v-if="$checkRole(item.role) || !item.role"
            :key="item.title"
            color="primary"
            link
            sub-group
            :to="item.to"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title class="text-overline">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>

        <template v-for="group in itemsGroup">
          <v-list-group
            v-if="$checkRole(group.role)"
            :key="group.key"
            :prepend-icon="group.icon"
            :value="group.value"
          >
            <template #activator>
              <v-list-item-title class="text-overline">
                {{ group.title }}
              </v-list-item-title>
            </template>
            <v-list-item
              v-for="item in group.items"
              :key="item.title"
              link
              :to="item.to"
            >
              <v-list-item-icon>
                <v-icon>
                  {{ item.icon }}
                </v-icon>
              </v-list-item-icon>
              <v-list-item-title class="text-overline">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list-group>
        </template>
      </v-list-item-group>
      <changelog />
      <!--v-list-item
        link
      >
        <v-list-item-icon>
          <v-icon>
            mdi-notebook-edit
          </v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>
            CHANGELOG
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item-->
    </v-list>
    <template #append>
      <v-list-group prepend-icon="mdi-cog" no-action>
        <template #activator>
          <v-list-item-content class="text-overline text-truncate">
            Menu Flutuante
          </v-list-item-content>
        </template>
        <v-list-item
          v-for="(item, i) in floatMenuItems"
          :key="`v-list-item-float-menu-${i}`"
          @click="item.toggleAction()"
        >
          <v-list-item-title class="text-overline">
            <v-icon color="primary" size="15" left>
              {{ item.icon }}
            </v-icon>
            {{ item.title }}
          </v-list-item-title>
          <v-list-item-action>
            <v-icon>
              {{ item.isActive ? "mdi-eye" : "mdi-eye-off" }}
            </v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list-group>
      <v-btn v-if="checkMobile" block tile color="primary" @click="logout">
        <v-icon left> mdi-exit-run </v-icon>
        Sair
      </v-btn>
      <v-list-item v-else link dark class="primary" @click="logout">
        <v-list-item-icon>
          <v-icon> mdi-exit-run </v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title> Sair </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-navigation-drawer>
</template>

<script>
// Utilities
import Changelog from "@/views/component/BaseChangelogDialog";
import { mapState, mapGetters } from "vuex";

export default {
  name: "DashboardCoreDrawer",
  components: {
    Changelog,
  },
  props: {
    expandOnHover: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      itemIndex: 0,
      miniVariant: true,
      idIncrement: 0,
      refreshKey: 0,
      items: [
        {
          icon: "mdi-face-agent",
          title: "Atendimentos",
          role: "atendimento",
          to: "/dashboard/atendimento",
        },
        {
          icon: "mdi-file-document",
          title: "Tickets",
          role: "tickets",
          to: "/dashboard/tickets/kanban",
        },
        {
          icon: "mdi-account-group",
          title: "Clientes",
          role: "clientes",
          to: "/dashboard/clientes/chaves",
        },
        {
          icon: "mdi-key",
          title: "Clientes",
          role: "chave",
          to: "/dashboard/clientes/chaves",
        },
        {
          icon: "mdi-monitor-eye",
          title: "Monitor",
          role: "monitor",
          to: "/dashboard/monitor",
        },
        {
          icon: "mdi-table-edit",
          title: "Cadastros",
          role: "cadastro",
          to: "/dashboard/cadastro/origem",
        },
        {
          icon: "mdi-calendar",
          title: "Agenda",
          role: "agenda",
          to: "/dashboard/agenda",
        },
      ],
      itemsGroup: [
        {
          title: "Indicadores",
          icon: "mdi-finance",
          value: false,
          role: "indicadores",
          to: "/dashboard/chart",
          items: [
            /*
              {
                icon: 'mdi-chart-bar',
                title: 'Rendimento diário',
                role: 'indicadores.rendimento-diario',
                to: '/dashboard/chart/diario',
              },
              */
            {
              icon: "mdi-chart-timeline",
              title: "Histórico diário",
              role: "indicadores.historico-diario",
              to: "/dashboard/chart/historico",
            },
          ],
        },
        {
          title: "Administrar",
          icon: "mdi-redhat",
          value: false,
          role: "admin",
          key: 0,
          items: [
            {
              title: "Pessoas",
              icon: "mdi-account-group",
              role: "admin.users-group",
              to: "/dashboard/admin/usuarios",
            },
            {
              title: "Perfil de Acesso",
              icon: "mdi-badge-account-horizontal",
              role: "admin.users-group",
              to: "/dashboard/admin/grupos",
            },
            /*
              {
                title: 'Atendimentos',
                icon: 'mdi-face-agent',
                role: 'admin.atendimento',
                to: '/dashboard/admin/atendimento',
              },
              */
          ],
        },
      ],
    };
  },

  computed: {
    ...mapGetters(["checkMobile"]),
    ...mapState(["barColor", "barImage"]),
    floatMenuItems() {
      return [
        {
          icon: "mdi-brush",
          title: "Tema",
          isActive: this.$store.state.Tema.floatMenu,
          toggleAction: () => this.$store.dispatch("Tema/toggleFloatMenu"),
        },
        {
          icon: "mdi-human-queue",
          title: "Fila Espera",
          isActive: this.$store.state.FilaEspera.floatMenu,
          toggleAction: () =>
            this.$store.dispatch("FilaEspera/toggleFloatMenu"),
        },
        {
          icon: "mdi-face-agent",
          title: "Atendimento",
          isActive: this.$store.state.AtendimentosOnline.floatMenu,
          toggleAction: () =>
            this.$store.dispatch("AtendimentosOnline/toggleFloatMenu"),
        },
        {
          icon: "mdi-calendar-today",
          title: "Agenda hoje",
          isActive: this.$store.state.Agenda.floatMenu,
          toggleAction: () => this.$store.dispatch("Agenda/toggleFloatMenu"),
        },
        {
          icon: "mdi-phone",
          title: "Cad. Telefone",
          isActive: this.$store.state.Fone.floatMenu,
          toggleAction: () => this.$store.dispatch("Fone/toggleFloatMenu"),
        },
      ];
    },
    idIncrementTxt() {
      return `id-increment-${this.idIncrement}`;
    },
    drawer: {
      get() {
        return this.$store.state.drawer;
      },
      set(val) {
        this.$store.commit("SET_DRAWER", val);
      },
    },
    computedItems() {
      return this.items.map(this.mapItem);
    },
    profile() {
      return {
        avatar: true,
        title: this.$t("titulo"),
      };
    },
  },

  watch: {
    $route(to, from) {
      this.checkGroupValue(to.path);
    },
  },

  methods: {
    checkGroupValue(path) {
      this.itemsGroup = this.itemsGroup.map((ig) => {
        ig.key++; // Rerender item group
        return {
          ...ig,
          value: ig.items.some((it) => it.to === path),
        };
      });
    },

    mapItem(item) {
      return {
        ...item,
        children: item.children ? item.children.map(this.mapItem) : undefined,
        title: this.$t(item.title),
      };
    },

    forceRerender() {
      this.refreshKey += 1;
    },

    async logout() {
      try {
        this.logoutLoading = true;
        // Desconecta o socket antes de fazer logout
        if (this.$socketio) {
          this.$socketio.clientDisconnect();
        }
        await this.$store.dispatch("logout", true);
        if (this.$router.name !== "login") {
          await this.$router.push({ name: "login" });
        }
      } catch (error) {
        console.error("Erro durante logout:", error);
        // Opcionalmente, você pode adicionar um alerta de erro aqui
      } finally {
        this.logoutLoading = false;
      }
    },
  },
};
</script>
