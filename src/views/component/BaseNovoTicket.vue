<template>
  <div
    class="grey lighten-4"
  >
    <v-sheet
      color="grey lighten-4"
      class="ml-2"
    >
      <span :class="`text-uppercase text-h3 font-weight-light ${isLoading ? 'text--disabled' : 'text--secondary'}`">
        {{ state.chave.idfantasia }}
      </span>
      <v-divider class="my-3" />
    </v-sheet>
    <v-row
      class="ml-2"
      no-gutters
    >
      <v-col
        cols="12"
        lg="4"
        xl="3"
      >
        <v-sheet
          :elevation="isLoading ? 0 : 1"
          color="rgba(0, 0, 0, 0)"
          class="d-flex justify-space-between mb-2"
        >
          <v-tabs
            v-model="state.fgticket"
            :disabled="true"
            grow
          >
            <v-tab
              :disabled="isLoading"
            >
              Ticket Público
            </v-tab>
            <v-tab
              :disabled="isLoading"
            >
              Ticket Interno
            </v-tab>
          </v-tabs>
        </v-sheet>
        <v-card
          class="mb-2 d-flex align-center"
          :flat="isLoading"
          rounded="0"
        >
          <v-card-text>
            <template
              v-if="state.fila"
            >
              <div
                class="text-overline"
              >
                Informações Fila Espera
              </div>
              <v-sheet
                class="d-flex align-start pa-2"
                elevation="2"
              >
                <v-icon>
                  mdi-message-reply-text
                </v-icon>
                <span
                  class="font-italic ml-1"
                  style="white-space: pre-line"
                >
                  {{ state.fila.mmobservacao ? state.fila.mmobservacao : 'N/D' }}
                </span>
              </v-sheet>
              <v-divider class="my-5" />
            </template>
            <div
              class="d-flex mb-2"
            >
              <solicitante-selector
                ref="solicitanteSelector"
                v-model="state.solicitante"
                :disabled="isLoading"
                :rules="[RREQUIRED]"
                :cdchave="state.cdchave"
                class="pr-2"
              />
              <novo-solicitante-pop-over
                :cdchave="state.cdchave"
                :disabled="isLoading"
                @afterAdd="afterAddSolicitante"
              />
            </div>
            <v-row no-gutters>
              <v-col
                cols="12"
              >
                <motivo-selector
                  ref="motivoSelector"
                  v-model="state.cdmotivo"
                  :rules="[RREQUIRED]"
                  :cdatendimento="cdatendimento"
                  :disabled="isLoading"
                  sync-atendimento
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col
                cols="12"
              >
                <v-autocomplete
                  v-model="state.cdsistema"
                  :items="state.sistema"
                  :disabled="isLoading"
                  label="Sistema"
                  prepend-inner-icon="mdi-database-search"
                  filled
                />
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="text--white"
            >
              <v-chip
                label
                class="ma-1"
                :disabled="isLoading"
              >
                <v-icon left>
                  mdi-application
                </v-icon>
                Commerce: {{ state.chave.idversaoexe | checkVoid }}
              </v-chip>
              <v-chip
                label
                class="ma-1"
                :disabled="isLoading"
              >
                <v-icon left>
                  mdi-database
                </v-icon>
                Firebird: {{ state.chave.idversaodb | checkVoid }}
              </v-chip>
              <v-chip
                label
                class="ma-1"
                :disabled="isLoading"
              >
                <v-icon left>
                  mdi-clock-alert
                </v-icon>
                <span
                  v-if="!isLoading"
                >
                  {{ state.chave.dtvalidade | str2calendar }}
                </span>
                <span
                  v-else
                >
                  ?
                </span>
              </v-chip>
            </v-row>
            <v-divider class="my-5" />
            <user-selector
              ref="userSelector"
              v-model="state.users"
              :force="[user.cd]"
              :disabled="isLoading"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        class="ml-lg-2 mt-2 mt-lg-0"
      >
        <v-card
          :flat="isLoading"
          rounded="0"
        >
          <v-card-text>
            <blue-print-input
              ref="nmassuntoInput"
              v-slot="{ errorMessages }"
              v-model="state.nmassunto"
              :rules="[RREQUIRED]"
            >
              <v-text-field
                label="Assunto"
                prepend-icon="mdi-label"
                filled
                :disabled="isLoading"
                :value="state.nmassunto"
                :error-messages="errorMessages"
                @change="state.nmassunto = $event"
              />
            </blue-print-input>
            <ck
              v-if="state.cdatendimento != undefined"
              ref="ck"
              v-model="state.mmdesc"
              :disabled="isLoading"
              :extra-headers="{ 'cd-atendimento': state.cdatendimento }"
            />
            <file-upload
              v-model="state.files"
              class="mt-2"
              :disabled="isLoading"
            />
          </v-card-text>
        </v-card>
        <v-sheet
          class="d-flex flex-row-reverse ml-2 mt-2"
          color="rgba(0, 0, 0, 0)"
        >
          <v-btn
            class="primary"
            tile
            depressed
            :disabled="loadingMessage != null || isLoading"
            @click="openModal"
          >
            Salvar
          </v-btn>
        </v-sheet>
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialog"
      max-width="600"
      height="480"
      :persistent="loadingMessage != null"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Novo Ticket</span>
        </v-card-title>
        <v-card-text>
          <situacao-selector
            ref="situacaoSelector"
            v-model="state.cdsituacao"
            :rules="[RREQUIRED]"
            :disabled="isLoading"
            @change="changeSituacao"
          />
          <urgencia-selector
            ref="urgenciaSelector"
            v-model="state.cdurgencia"
            :rules="[RREQUIRED]"
            :disabled="isLoading || state.cdsituacao == null || situacaoFinalizado"
            @input="state.dtprevisao = $moment().add('days', urgenciaState.nprevisao).format('YYYY-MM-DD')"
          />
          <date-picker
            ref="dtprevisao"
            v-model="state.dtprevisao"
            :disabled="isLoading || state.cdurgencia == null || situacaoFinalizado"
            :show-actions="false"
            :allowed-dates="allowedDates"
            :rules="[RREQUIRED]"
            :component-props="{
              filled: true,
              label: 'Previsão',
            }"
            show-day-text
          />
          <user-selector
            ref="responsavelSelector"
            v-model="responsavel"
            prepend-icon=""
            label="Responsável"
            :rules="[RREQUIRED]"
            :multiple="false"
            :disabled="situacaoFinalizado"
            :force="null"
          />
          <v-sheet
            class="d-flex justify-end"
          >
            <v-btn
              class="primary"
              tile
              depressed
              :disabled="loadingMessage != null || isLoading"
              @click="send"
            >
              <span v-if="loadingMessage != null">
                <v-progress-circular
                  indeterminate
                  :size="25"
                  :width="3"
                />
                {{ loadingMessage }}
              </span>
              <span v-else>
                Criar Ticket
              </span>
            </v-btn>
          </v-sheet>
        </v-card-text>
        <v-progress-linear
          v-show="loadingMessage != null"
          color="primary"
          buffer-value="0"
          :value="uploadStatus"
          stream
          height="6"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import SituacaoSelector from '@/views/component/BaseSituacaoSelector.vue'
  import UrgenciaSelector from '@/views/component/BaseUrgenciaSelector.vue'
  import SolicitanteSelector from '@/views/component/BaseSolicitanteSelector.vue'
  import NovoSolicitantePopOver from '@/views/component/BaseNovoSolicitantePopOver.vue'
  import UserSelector from '@/views/component/BaseUserSelector.vue'
  import MotivoSelector from '@/views/component/BaseMotivoSelector.vue'
  import FileUpload from '@/views/component/BaseFileUpload.vue'
  import BluePrintInput from '@/views/component/BluePrintInput.vue'
  import Ck from '@/views/component/SimpleEditor.vue'
  import DatePicker from '@/views/component/BaseDatePicker'
  import { mapGetters, mapState } from 'vuex'
  import { cloneDeep } from 'lodash'

  export default {
    name: 'NovoTicket',
    components: {
      Ck,
      SituacaoSelector,
      UrgenciaSelector,
      SolicitanteSelector,
      NovoSolicitantePopOver,
      UserSelector,
      FileUpload,
      MotivoSelector,
      BluePrintInput,
      DatePicker,
    },
    props: {
      props: {
        type: Object,
        default: () => {},
      },
      cdatendimento: {
        type: Number,
        default: null,
      },
      atendimentos: {
        type: Array,
        default: () => [],
      },
      loading: {
        type: Boolean,
        default: () => false,
      },
    },

    data () {
      return {
        urgencia: null,
        dialog: false,
        state: {},
        disable: true,
        statesAdded: {},
        firstRefresh: false,
        loadingMessage: null,
        stateIndex: null,
        responsavel: null,
        situacaoFinalizado: false,
        firstState: {
          valid: true,
          cdticket: null,
          mmdesc: '',
          solicitante: null,
          fgticket: 0,
          cdchave: null,
          chave: {
            idversaodb: '?',
            idversaoexe: '?',
            dtvalidade: '?',
            dtatualizacao: '?',
            idfantasia: 'NOME FANTASIA',
          },
          cdsistema: 0,
          sistema: [
            { value: 0, text: 'Commerce' },
            { value: 1, text: 'Coletas' },
            { value: 2, text: 'Tablet' },
          ],
          cdurgencia: null,
          cdsituacao: null,
          cdmotivo: null,
          dtprevisao: null,
          fila: null,
          users: [],
          files: [],
          nmassunto: '',
          assuntoErrorMessage: null,
        },
        states: [],
      }
    },

    computed: {
      ...mapGetters(['user']),
      ...mapState('NovoTicket', ['uploadStatus']),

      ticketDTO: function () {
        if (this.state) {
          const ret = {
            fgticket: parseInt(this.state.fgticket),
            cdsistema: this.state.cdsistema,
            cdsituacao: this.state.cdsituacao, // *
            // cdurgencia: this.state.cdurgencia, // *
            cdatendimento: this.state.cdatendimento,
            cdsolicitante: this.state.solicitante.cd, // *
            cdresponsavel: this.responsavel,
            // dtprevisao: this.$moment(this.state.dtprevisao).format('YYYY-MM-DD'),
            users: this.state.users,
          }

          if (!this.situacaoFinalizado) {
            ret.cdurgencia = this.state.cdurgencia
            ret.dtprevisao = this.$moment(this.state.dtprevisao).format('YYYY-MM-DD')
          }

          return ret
        }
        return null
      },

      acaoDTO: function () {
        if (this.state) {
          return {
            cdticket: this.state.cdticket,
            nmassunto: this.state.nmassunto,
            mmdesc: this.state.mmdesc,
            jsanexos: this.state.files.map(it => {
              return {
                name: it.name,
                size: it.size,
              }
            }),
          }
        }
        return null
      },

      isLoading: function () {
        if (this.loading || this.disable || this.loadingMessage !== null) {
          return true
        }
        return false
      },

      urgenciaState: function () {
        if (this.state.cdurgencia != null) {
          return this.urgencia?.find(it => it.cd === this.state.cdurgencia)
        }
        return null
      },

      allowedDates: function () {
        if (this.urgencia) {
          const urgencia = this.urgencia.find(it => it.cd === this.state.cdurgencia)
          if (urgencia) {
            const dtinicio = this.$moment().format('YYYY-MM-DD')
            const dtfim = this.$moment().add('days', urgencia.nprevisao).format('YYYY-MM-DD')
            return val => val >= dtinicio && val <= dtfim
          }
        }
        return val => false
      },
    },

    watch: {
      state: {
        handler: async function (oldVal, newVal) {
          if (oldVal?.cdatendimento === newVal?.cdatendimento) {
            await this.$store.dispatch('NovoTicket/update', newVal)
          }
        },
        deep: true,
      },
    },

    created () {
      this.$store.dispatch('NovoTicket/initialize')
      this.responsavel = this.user.cd
      this.state = cloneDeep(this.firstState)
      this.$store.dispatch('allUrgencia').then(items => { this.urgencia = items })
    },

    methods: {
      changeSituacao (cd) {
        if (cd === 4) {
          this.responsavel = this.user.cd
          this.situacaoFinalizado = true
          this.state.cdurgencia = null
          this.state.dtprevisao = null
        } else {
          this.situacaoFinalizado = false
        }
      },

      async changeState (index) {
        this.formReset()
        await this.refreshStates()
        if (this.states[index] != null && index != null) {
          this.disable = false
          this.state = this.states[index]
          this.stateIndex = index
        } else if (this.states.length > 0 && index != null) {
          this.stateIndex = this.states.length - 1
          this.disable = false
          this.state = this.states[this.stateIndex]
        } else {
          this.disable = true
          this.state = this.firstState
          this.stateIndex = null
        }
        await this.$refs.ck?.restart()
      },

      async removeState () {
        this.states.splice(this.stateIndex, 1)
        // await this.changeState(this.stateIndex)
      },

      // Normalmente acionado após alteração dos atendimentos
      async refreshStates () {
        for (const atendimento of this.atendimentos) {
          if (atendimento.cd != null && this.statesAdded[atendimento.cd] == null) {
            this.statesAdded[atendimento.cd] = true
            await this.addState(atendimento)
          }
        }
      },

      async addState (atendimento) {
        const chave = await this.$store.dispatch('allChaves')
        let stateCopy = await this.$store.dispatch('NovoTicket/fetch', atendimento.cd)
        if (stateCopy == null) {
          stateCopy = cloneDeep(this.firstState)
          stateCopy.cdatendimento = atendimento.cd
          stateCopy.cdchave = atendimento.chave.cd
          stateCopy.chave = atendimento.chave
          stateCopy.users = [this.user.cd]
          stateCopy.nmassunto = ''
          stateCopy.cdmotivo = atendimento._cdmotivo
          stateCopy.chave = chave.find(it => it.cd === stateCopy.cdchave)
          if (atendimento.fila) {
            stateCopy.fila = atendimento.fila
            stateCopy.solicitante = atendimento.fila.solicitante
          }
          await this.$store.dispatch('NovoTicket/add', stateCopy)
        }
        this.states.push(stateCopy)
      },

      formValidate (step = 0) {
        let ret = true;
        [
          'motivoSelector',
          'situacaoSelector', //
          'responsavelSelector',
          'solicitanteSelector', //
          'urgenciaSelector', //
          'nmassuntoInput', //
          'userSelector',
          'dtprevisao',
        ].forEach(it => {
          if (step === 0) {
            if (['situacaoSelector', 'responsavelSelector', 'urgenciaSelector', 'dtprevisao'].includes(it)) {
              return
            }
          }

          if (step === 1 && this.situacaoFinalizado) {
            if (['dtprevisao', 'urgenciaSelector'].includes(it)) {
              return
            }
          }

          if (!this.$refs[it].validate()) {
            ret = false
          }
        }, this)

        if (!ret) {
          throw new Error('Campos obrigatórios não preenchidos')
        }

        if (this.$refs.ck?.getDataUsage() > 100) {
          throw new Error('Descrição da Ação ultrapassou limite permitido (900Kb)')
        }
      },

      formReset () {
        [
          'motivoSelector',
          'solicitanteSelector',
          'situacaoSelector',
          'urgenciaSelector',
          'nmassuntoInput',
        ].forEach(it => {
          if (this.$refs[it]) {
            this.$refs[it].reset()
          }
        })
      },

      afterAddSolicitante (cd) {
        this.$refs.solicitanteSelector.newValue(parseInt(cd))
      },

      openModal () {
        this.responsavel = this.user.cd
        try {
          this.formValidate(0)
          this.dialog = true
        } finally {
        }
      },

      async send () {
        try {
          if (this.state.cdmotivo === 49) {
            return this.$notifier({ content: 'Selecione um motivo válido', color: 'orange' })
          }
          this.loadingMessage = 'Criando Ticket'
          this.formValidate(1)

          const { ticket, acao } = await this.$store.dispatch('addTicketAcao', {
            ticket: this.ticketDTO,
            acao: this.acaoDTO,
          })

          if (this.state.files.length > 0) {
            if (ticket.cd == null || acao.cd == null) {
              this.$notifier({ content: 'Erro ao salvar anexos', color: 'error' })
            } else {
              this.loadingMessage = 'Carregando anexos'
              await this.$store.dispatch('NovoTicket/uploadAcaoFiles', {
                files: this.state.files,
                ticketcd: ticket.cd,
                acaocd: acao.cd,
              })
            }
          }
          this.$notifier({ content: `Ticket criado (ID ${ticket.cd})`, color: 'success' })
          this.removeState()
          this.$emit('afterSendTicket')
          this.dialog = false
        } finally {
          this.loadingMessage = null
        }
      },
    },
  }
</script>
