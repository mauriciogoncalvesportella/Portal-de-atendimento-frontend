<template functional>
  <v-card
    :id="props.customId"
    :style="`${ props.ticket.style }; ${ props.active ? 'border: 2px solid var(--v-primary-base);' : ''}`"
    class="ma-1"
    height="140px"
    @click="listeners['open-ticket'](props.ticket, props.userIndex)"
  >
    <v-card-title
      class="d-block text-truncate ma-0 pa-0 px-1"
    >
      <v-icon
        small
      >
        mdi-file-document
      </v-icon>
      {{ props.ticket.cd }} - {{ props.chaveMap[props.ticket.atendimento._cdchave].idfantasia }}
    </v-card-title>
    <component :is="injections.components.VDivider" />
    <component
      :is="injections.components.VCardText"
      class="pa-0"
    >
      <div
        class="d-flex flex-column text-truncate pa-0 pl-3 pb-2 pt-1 text-body-1"
      >
        <!--
        {{ props.metaMap.movito[props.ticket.atendimento._cdmotivo].nmmotivo }}
        -->
        <span>
          {{ props.metaMap.motivo[props.ticket.atendimento._cdmotivo].nmmotivo }}
        </span>
        <span
          class="text-overline"
        >
          {{ props.ticket.nmtitulo }}
        </span>
        <div
          class="d-flex align-center"
        >
          <component
            :is="injections.components.VChip"
            class="text-overline"
            v-bind="{ small: true, label: true }"
          >
            <v-icon
              :size="15"
              :color="props.metaMap.urgencia[props.ticket._cdurgencia].idcolor"
              left
            >
              mdi-checkbox-blank-circle
            </v-icon>
            {{ props.metaMap.urgencia[props.ticket._cdurgencia].nmurgencia }}
          </component>
          <component
            :is="injections.components.VChip"
            v-if="props.ticket.dtprevisao"
            class="text-overline ml-1"
            v-bind="{ small: true, label: true }"
          >
            <v-icon
              small
            >
              mdi-clock-alert
            </v-icon>
            <div
              v-if="props.ticket.dtprevisao"
              :class="`d-flex font-weight-bold align-center ml-2 text-overline ${props.stylizePrevisao(props.ticket.dtprevisao)}`"
              style="font-size: 30px"
            >
              {{ props.ticket.dtprevisao | str2calendar }}
            </div>
          </component>
        </div>
      </div>
      <component :is="injections.components.VDivider" />
      <div
        class="d-flex align-center justify-space-between"
      >
        <div
          class="ml-1 font-weight-light"
        >
          {{ props.ticket.dtcriacao | str2calendar }}
        </div>
        <!--div
          class="d-flex justify-end pa-1"
        >
          <user-initials-avatar
            v-for="cduser in userList"
            :key="`user-initals-avatar-${cduser}`"
            :cduser="cduser"
            :color="`${ticket._cdresponsavel === cduser ? 'primary' : 'grey darken-2'}`"
            :size="20"
          />
        </div-->
      </div>
    </component>
  </v-card>
</template>

<script>
  import Vue from 'vue'
  import { VDivider, VCardText, VChip } from 'vuetify/lib'
  export default {
    inject: {
      components: {
        default: {
          VDivider,
          VCardText,
          VChip,
        },
      },
    },
    props: {
      ticket: {
        type: Object,
        default: () => {},
      },
      userIndex: {
        type: Number,
        default: null,
      },
      userList: {
        type: Array,
        default: () => [],
      },
      chaveMap: {
        type: Object,
        default: () => ({}),
      },
      metaMap: {
        type: Object,
        default: () => ({
          urgencia: {},
          motivo: {},
        }),
      },
      stylizePrevisao: {
        type: Function,
        default: Vue.prototype.$stylizePrevisao,
      },
      customId: {
        type: String,
        default: null,
      },
      active: {
        type: Boolean,
        default: false,
      },
    },
  }
</script>
