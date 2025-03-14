<template>
  <v-menu
    :value="value"
    :close-on-content-click="false"
    :activator="selectedElement"
    auto
    min-width="400px"
  >
    <v-card
      color="grey lighten-4"
      flat
    >
      <v-toolbar
        :color="color"
        flat
        dark
      >
        <v-btn icon>
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-toolbar-title
          v-if="selectedEvent.evento"
        >
          {{ selectedEvent.evento.nmtitulo }}
          {{ tipoAgendamentoText }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="$emit('input', false)"
        >
          <v-icon>mdi-close-box</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        {{ selectedEvent.evento }}
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    props: {
      selectedEvent: {
        type: Object,
        default: () => {},
      },
      selectedElement: {
        type: HTMLElement,
        default: () => null,
      },
      value: {
        type: Boolean,
        default: false,
      },
    },

    computed: {
      ...mapGetters(['tipoAgendamentoMap', 'chaveMap', 'userMap']),
      color () {
        if (this.selectedEvent?.evento) {
          const user = this.userMap[this.selectedEvent.evento._cdusers[0]]
          return user.idcolor || 'rgb(125, 125, 125)'
        }
        return 'rgb(125, 125, 125)'
      },
      tipoAgendamentoText () {
        if (this.selectedEvent?.evento) {
          const tipoAgendamento = this.tipoAgendamentoMap[this.selectedEvent.evento._cdtipoagendamento]
          return `- ${tipoAgendamento.nmtipoagendamento}`
        }
        return ''
      },
    },
  }
</script>
