<template>
  <v-menu
    :key="`menu-${menuKey}`"
    v-model="menu"
    :close-on-click="true"
    :close-on-content-click="false"
    origin="center center"
    top
    offset-x
    transition="slide-x-transition"
    @show="show"
  >
    <template #activator="{ on }">
      <v-btn
        icon
        v-on="on"
        @click="show"
      >
        <v-icon> mdi-pencil </v-icon>
      </v-btn>
    </template>

    <v-card
      width="400"
    >
      <v-card-title>
        Detalhes Ticket
      </v-card-title>
      <v-card-text>
        <cliente-selector
          ref="clienteSelectorInput"
          v-model="dataItem.chave.cd"
          :multiple="false"
          :rules="[ RREQUIRED ]"
          solo
        />
        <v-text-field
          :value="date"
          type="date"
          label="Data"
          solo
          readonly
          dense
          prepend-inner-icon="mdi-calendar"
        />
        <v-sheet
          class="d-flex align-center"
        >
          <v-chip
            class="flex-grow-1"
          >
            <v-icon
              left
            >
              mdi-play
            </v-icon>
            {{ dtinicio | str2date }}
          </v-chip>
          <v-chip
            class="ml-1 flex-grow-1"
          >
            <v-icon
              left
            >
              mdi-flag
            </v-icon>
            {{ dtfim | str2date }}
          </v-chip>
          <tempo-chip-color
            class="ml-1 flex-grow-1"
            :sec="dttotal"
            :small="false"
            :icon="true"
          />
          <v-btn
            :disabled="loading"
            icon
            small
            color="green"
            @click="dataItem.jslista.push({ dtinicio: null, dtfim: null })"
          >
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
        </v-sheet>
        <v-divider
          class="my-3"
        />
        <v-sheet
          v-for="(timeElapse, i) in dataItem.jslista"
          :key="`time-elapse-${i}`"
          :class="`d-flex justify-center m-0 ${i > 0 ? 'mt-3' : ''}`"
        >
          <div
            class="mt-1"
          >
            <v-chip
              color="grey lighten-3"
              class="mr-1"
              label
            >
              <v-icon
                color="grey"
                left
              >
                mdi-play
              </v-icon>
              <v-text-field
                :value="timeElapse.dtinicio ? $moment(timeElapse.dtinicio).format('HH:mm:ss') : null"
                class="d-inline-block mt-3"
                style="max-width: 70px; height: 48px;"
                type="time"
                step="1"
                :error-messages="`${isValidJslista ? '' : ' '}`"
                dense
                @change="changeTime(i, 'dtinicio', $event)"
              />
            </v-chip>
            <v-chip
              color="grey lighten-3"
              class="ml-1"
              label
            >
              <v-icon
                color="grey"
                left
              >
                mdi-flag
              </v-icon>
              <v-text-field
                :value="timeElapse.dtfim ? $moment(timeElapse.dtfim).format('HH:mm:ss') : null"
                class="ml-2 mt-3 d-inline-block"
                style="max-width: 70px; height: 48px;"
                type="time"
                step="1"
                :error-messages="`${isValidJslista ? '' : ' '}`"
                dense
                @change="changeTime(i, 'dtfim', $event)"
              />
            </v-chip>
          </div>
          <v-btn
            icon
            color="red"
            class="ml-2"
            absolute
            right
            @click="dataItem.jslista.splice(i, 1)"
          >
            <v-icon>
              mdi-delete
            </v-icon>
          </v-btn>
        </v-sheet>
      </v-card-text>
      <v-divider />
      <v-card-actions
        class="d-flex justify-space-between align-center pa-0 ma-0"
      >
        <v-btn
          :disabled="loading"
          text
          color="red"
          @click="menu = false"
        >
          fechar
        </v-btn>
        <v-spacer />
        <div>
          <v-btn-toggle
            v-if="dataItem.dtfim == null"
            v-model="doneAtendimento"
            dense
            borderless
            class="ma-0 pa-0"
          >
            <v-btn
              text
              color="primary"
              small
              dense
              :disabled="!isValidJslista"
            >
              Finalizar
            </v-btn>
          </v-btn-toggle>
          <v-btn
            text
            :disabled="loading"
            :loading="loading"
            color="green"
            @click="save"
          >
            salvar
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
  import { cloneDeep } from 'lodash'
  export default {
    components: {
      TempoChipColor: () => import('@/views/component/TempoChipColor.vue'),
      ClienteSelector: () => import('../component/BaseClientesSelector.vue'),
    },

    props: {
      item: {
        type: Object,
        default: () => {},
      },
    },

    data () {
      return {
        loading: false,
        date: null,
        menu: false,
        menuKey: 0,
        doneAtendimento: null,
        dtfimCheck: this.item.dtfim != null,
        dataItem: null,
      }
    },

    computed: {
      dtinicio () {
        const dtinicio = this.dataItem?.jslista[0]?.dtinicio || null
        if (!dtinicio) {
          return null
        }
        return dtinicio
      },
      dtfim () {
        const dtfim = this.dataItem?.jslista?.slice(-1)[0]?.dtfim || null
        if (!dtfim || !this.dtinicio) {
          return null
        }
        return dtfim
      },
      atendimentoDTO () {
        return {
          cd: this.dataItem.cd,
          dtinicio: this.dtinicio,
          dtfim: this.dtfim,
          cdchave: this.dataItem.chave.cd,
          jslista: this.dataItem.jslista,
          done: this.doneAtendimento === 0,
        }
      },
      isValidJslista () {
        return this.$validateTimesElapses(this.dataItem.jslista)
      },
      dttotal () {
        if (this.isValidJslista) {
          return this.$sumAtendimentos(this.dataItem.jslista).sum
        }
        return null
      },
    },

    created () {
      this.dataItem = cloneDeep(this.item)
    },

    methods: {
      async save () {
        this.loading = true
        try {
          if (!this.$refs.clienteSelectorInput.validate()) {
            throw new Error('Campos obrigatórios não preenchidos')
          }
          if (!this.isValidJslista) {
            throw new Error('Lista de horários inválida')
          }
          await this.$store.dispatch('updateAtendimento', this.atendimentoDTO)
          this.$notifier({ content: 'Atualizado com sucesso', color: 'green' })
          this.$emit('done')
        } catch (err) {
          this.$notifier({ content: err, color: 'red' })
        } finally {
          this.loading = false
        }
      },

      changeTime (index, key, time) {
        if (/(^[0-9]{2}:[0-9]{2}:[0-9]{2}$)|(^[0-9]{2}:[0-9]{2}$)/.test(time)) {
          time = time.split(':')
          this.dataItem.jslista[index][key] = this.$moment(this.date, 'YYYY-MM-DD')
            .set({
              hour: time[0],
              minute: time[1],
              second: time[2] || 0,
            })
            .utc()
            .format()
        } else {
          this.dataItem.jslista[index][key] = null
        }
      },

      show () {
        this.date = this.$moment(this.dataItem.dtinicio).format('YYYY-MM-DD')
      },
    },
  }
</script>

<style>
/* https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/core/html/resources/controls_refresh.css?q=type%3D%22time%22&originalUrl=https:%2F%2Fcs.chromium.org%2F */
input[type="time" i]::-webkit-calendar-picker-indicator {
  display: none;
}
</style>
