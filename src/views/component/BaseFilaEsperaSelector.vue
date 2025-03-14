<template>
  <div
    class="d-flex flex-column flex-grow-1"
  >
    <div
      class="d-flex flex-grow-1 flex-shrink-0 align-center"
    >
      <v-autocomplete
        :loading="loading.getAllOnline"
        :items="fila"
        :disabled="disabled"
        :prepend-inner-icon="prependIcon"
        :error-messages="errMsg"
        item-text="cdsolicitante.idsolicitante"
        item-value="cd"
        no-data-text="Vazio"
        hide-details="auto"
        dense
        small
        filled
        :label="label"
        validate-on-blur
        :value="value"
        style="width: 100%"
        :filter="filter"
        @change="onChange"
      >
        <template #selection="{ item }">
          <span
            class="text-truncate"
            style="max-width: 200px"
          >
            {{ chaveMap[item._cdchave].idfantasia }}
          </span>
          <span
            class="ml-1"
          >
            ({{ item.cdsolicitante.idsolicitante }})
          </span>
          <!--v-chip
            v-bind="data.attrs"
            :input-value="data.selected"
            close
            @click="data.select"
            @click:close="remove(data.item)"
          >
            <v-avatar left>
              <v-img :src="data.item.avatar"></v-img>
            </v-avatar>
            {{ data.item.name }}
          </v-chip!-->
        </template>
        <template
          #item="{ item }"
        >
          <v-list-item-icon
            class="text-button"
          >
            #{{ item.cd }}
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-html="chaveMap[item._cdchave].idfantasia">
              {{ chaveMap[item._cdchave].idfantasia }}
              <v-icon
                v-if="item.fgurgente"
                color="red"
              >
                mdi-alert
              </v-icon>
            </v-list-item-title>
            <v-list-item-subtitle v-html="item.cdsolicitante.idsolicitante" />
          </v-list-item-content>
          <v-icon
            v-if="item.fgurgente"
            class="mr-1"
            color="red"
          >
            mdi-alert
          </v-icon>
          <user-initials-avatar
            v-if="item._cduser != null"
            :cduser="item._cduser"
          />
          <base-cronometro
            class="ml-1"
            :date="item.dtcriacao"
          />
        </template>
      </v-autocomplete>
      <v-btn
        icon
        small
        color="red"
        @click="$emit('clearHandle')"
      >
        <v-icon>
          mdi-close
        </v-icon>
      </v-btn>
      <v-btn
        icon
        small
        color="blue"
        @click="$store.dispatch('FilaEspera/getAllOnline', true)"
      >
        <v-icon>
          mdi-refresh
        </v-icon>
      </v-btn>
    </div>
    <v-fade-transition>
      <v-sheet
        v-if="selected.cd > 0"
        class="d-flex align-start mt-2 pa-2"
        elevation="2"
      >
        <v-icon>
          mdi-message-reply-text
        </v-icon>
        <span
          class="font-italic ml-1"
          style="white-space: pre-line"
        >
          {{ selected.mmobservacao ? selected.mmobservacao : 'N/D' }}
        </span>
      </v-sheet>
    </v-fade-transition>
  </div>
</template>

<script>
  import BluePrintValidate from '@/views/component/BluePrintValidate.vue'
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad'
  import { mapState, mapGetters } from 'vuex'
  import BaseCronometro from '@/views/component/BaseCronometro.vue'
  import UserInitialsAvatar from '@/views/component/BaseUserInitialsAvatar'

  export default {
    components: {
      BaseCronometro,
      UserInitialsAvatar,
    },
    mixins: [BluePrintValidate, DependenciesLoad],
    props: {
      value: {
        type: Number,
        default: null,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      prependIcon: {
        type: String,
        default: '',
      },
      label: {
        type: String,
        default: 'Fila Espera',
      },
    },

    data: () => ({
      dependenciesConfig: {
        dependencies: [
          { action: 'allChaves', mutation: 'SET_CHAVES' },
          { action: 'userMap', mutation: 'SET_USERMAP' },
        ],
      },
    }),

    computed: {
      ...mapState('FilaEspera', ['fila', 'loading']),
      ...mapGetters(['chaveMap', 'userMap', 'user']),
      selected () {
        return this.fila.find(item => item.cd === this.value) ?? {}
      },
    },

    mounted () {
      this.$store.dispatch('FilaEspera/getAllOnline')
    },

    methods: {
      onChange (value) {
        if (value != null) {
          this.$emit('change', value)
        }
        this.$emit('input', value)
      },

      filter (item, queryText) {
        const check = (s1, s2) => s1.toLocaleLowerCase().indexOf(s2.toLocaleLowerCase()) > -1
        const checkIdfantasia = check(this.chaveMap[item._cdchave].idfantasia, queryText)
        const checkIdsolicitante = check(item.cdsolicitante.idsolicitante, queryText)
        return checkIdfantasia || checkIdsolicitante
      },
    },
  }
</script>
