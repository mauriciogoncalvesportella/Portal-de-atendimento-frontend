<template>
  <div id="settings-wrapper">
    <div
      style="position: fixed; top: 75px; right: 0px; border-radius: 8px; z-index: 100"
    >
      <div
        class="d-flex flex-column"
      >
        <template
          v-for="(item, i) in floatMenuItems"
        >
          <v-badge
            v-show="item.isActive"
            :key="`v-card-float-menu-${i}`"
            bordered
            :color="item.notifyColor"
            :class="i > 0 ? 'mt-3' : ''"
            :value="item.notifyIcon ? 1 : (item.notifyValue ? item.notifyValue : 0)"
            :content="item.notifyIcon ? null : item.notifyValue"
            :icon="item.notifyIcon ? item.notifyIcon : null"
            overlap
            left
          >
            <v-tooltip
              left
            >
              <template
                #activator="{ on }"
              >
                <v-card
                  :id="item.id"
                  v-on="on"
                  class="d-flex align-center justify-center"
                  height="40"
                  width="50"
                  elevation="5"
                  :style="`cursor: ${item.cursor ? item.cursor : 'pointer'}; border-radius: 5px 0px 0px 5px`"
                >
                  <v-progress-circular
                    v-if="item.loading"
                    size="22"
                    indeterminate
                    color="primary"
                    width="3"
                  />
                  <v-icon
                    v-else
                    large
                    :color="item.iconColor ? item.iconColor : 'primary'"
                  >
                    {{ item.icon }}
                  </v-icon>
                </v-card>
              </template>
              {{ item.tooltipText }}
            </v-tooltip>
          </v-badge>
        </template>
      </div>
      <float-menu-theme />
      <float-menu-fila-espera />
      <float-menu-cadastro-fone />
      <float-menu-atendimentos-online />
    </div>
  </div>
</template>

<script>
  // Mixins
  import Proxyable from 'vuetify/lib/mixins/proxyable'
  import { mapGetters } from 'vuex'
  import FloatMenuCadastroFone from './float-menu/FloatMenuCadastroFone.vue'

  export default {
    name: 'DashboardCoreSettings',
    components: {
      FloatMenuTheme: () => import('./float-menu/FloatMenuTheme.vue'),
      FloatMenuFilaEspera: () => import('./float-menu/FloatMenuFilaEspera.vue'),
      FloatMenuAtendimentosOnline: () => import('./float-menu/FloatMenuAtendimentosOnline.vue'),
      FloatMenuCadastroFone,
    },
    mixins: [Proxyable],
    computed: {
      ...mapGetters(['user']),
      floatMenuItems () {
        return [
          {
            id: this.$store.state.Tema.cssId,
            icon: 'mdi-brush',
            isActive: this.$store.state.Tema.floatMenu,
            tooltipText: 'Cor tema',
          },
          {
            id: this.$store.state.FilaEspera.cssId,
            icon: 'mdi-human-queue',
            loading: this.$store.state.FilaEspera.loading.getAllOnline,
            isActive: this.$store.state.FilaEspera.floatMenu,
            notifyValue: this.$store.state.FilaEspera.fila.length,
            notifyColor: this.$store.state.FilaEspera.fila.some(item => item.fgurgente) ? 'red' : 'primary',
            notifyIcon: this.$store.state.FilaEspera.fila.some(item => item._cduser === this.user.cd) ? 'mdi-account-alert' : null,
            tooltipText: 'Atendimentos na fila de espera',
          },
          {
            id: this.$store.state.AtendimentosOnline.cssId,
            icon: 'mdi-face-agent',
            isActive: this.$store.state.AtendimentosOnline.floatMenu,
            loading: this.$store.state.AtendimentosOnline.loading.getOnline,
            notifyValue: this.$store.getters['AtendimentosOnline/total'],
            tooltipText: 'Atendimentos em aberto',
          },
          {
            id: this.$store.state.Agenda.cssId,
            icon: 'mdi-calendar-today',
            isActive: this.$store.state.Agenda.floatMenu,
            loading: this.$store.state.Agenda.loading.getOwnTodayEvents,
            notifyValue: this.$store.getters['Agenda/ownTodayEventsTotal'],
            tooltipText: 'Agendamentos do dia',
          },
          {
            id: this.$store.state.Fone.cssId,
            icon: 'mdi-phone',
            isActive: this.$store.state.Fone.floatMenu,
            iconColor: 'primary',
            loading: this.$store.state.Fone.loading.getFoneList,
            notifyValue: this.$store.state.Fone?.fila?.length || 0,
            tooltipText: 'Cad. de Telefones',
          },
          {
            id: 'socket-connection',
            icon: this.$store.state.SocketStatus.connected ? 'mdi-check-network' : 'mdi-close-network',
            isActive: true,
            iconColor: this.$store.state.SocketStatus.connected ? 'green' : 'red',
            cursor: 'default',
            tooltipText: 'Status conexão com o servidor',
          },
        ]
      },
    },
  }
</script>

<style lang="sass">
  .v-settings
    .v-item-group > *
      cursor: pointer

    &__item
      border-style: solid
      border-color: transparent !important

      &--active
        border-color: #00cae3 !important
</style>
