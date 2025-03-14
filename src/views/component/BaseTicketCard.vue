<template>
  <v-card
    :style="ticket.style"
    @click="$emit('open-ticket', ticket, userIndex)"
  >
    <v-card-title
      class="d-block text-truncate ma-0 pa-0 px-1"
    >
      <v-icon
        small
      >
        mdi-file-document
      </v-icon>
      {{ ticket.cd }} - {{ chaveMap[ticket.atendimento._cdchave].idfantasia }}
    </v-card-title>
    <v-divider />
    <v-card-text
      class="pa-0"
    >
      <div
        class="d-block text-truncate pa-0 pl-3 pb-2 pt-1 text-body-1"
      >
        {{ motivo[ticket.atendimento._cdmotivo].nmmotivo }}
        <br>
        <strong>
          {{ ticket.nmtitulo }}
        </strong>
        <br>
        <div
          class="d-flex align-center mt-1"
        >
          <v-chip
            small
          >
            <v-icon
              :size="15"
              :color="urgencia[ticket._cdurgencia].idcolor"
              left
            >
              mdi-checkbox-blank-circle
            </v-icon>
            {{ urgencia[ticket._cdurgencia].nmurgencia }}
          </v-chip>
          <div
            v-if="ticket.dtprevisao"
            :class="`ml-2 ${$stylizePrevisao(ticket.dtprevisao)}`"
          >
            {{ ticket.dtprevisao | str2calendar }}
          </div>
        </div>
      </div>
      <v-divider />
      <div
        class="d-flex align-center justify-space-between"
      >
        <div
          class="ml-1 font-weight-light"
        >
          {{ ticket.dtcriacao | str2calendar }}
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
    </v-card-text>
  </v-card>
</template>

<script>
  // import UserInitialsAvatar from '@/views/component/BaseUserInitialsAvatar'
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad.vue'
  import { mapGetters } from 'vuex'

  export default {
    components: {
      // UserInitialsAvatar,
    },
    extends: DependenciesLoad,
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
    },

    data () {
      return {
        dependenciesConfig: {
          route: this.$route.name,
          dependencies: [
            { action: 'allChaves', mutation: 'SET_CHAVES' },
            { action: 'allMeta', mutation: 'SET_TICKET_META' },
          ],
        },
      }
    },

    computed: {
      ...mapGetters(['metaMap', 'chaveMap']),
      urgencia () {
        return this.metaMap.urgencia ?? {}
      },
      motivo () {
        return this.metaMap.motivo ?? {}
      },
    },
  }
</script>
