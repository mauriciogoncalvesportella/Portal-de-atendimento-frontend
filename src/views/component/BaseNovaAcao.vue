<template>
  <div>
    <div
      class="d-flex justify-space-between align-center mb-2"
    >
      <blue-print-input
        ref="nmassuntoInput"
        v-slot="{ errorMessages }"
        v-model="nmassunto"
        :rules="[RREQUIRED]"
      >
        <v-text-field
          v-model="nmassunto"
          label="Assunto"
          prepend-inner-icon="mdi-label"
          dense
          filled
          hide-details="auto"
          style="min-width: 400px;"
          :disabled="checkDisabled"
          :error-messages="errorMessages"
        />
      </blue-print-input>
      <div
        class="d-flex align-center"
      >
        <v-btn
          icon
          :color="isPlaying ? 'red' : 'success'"
          :loading="loadingStopStart"
          class="mr-2"
          @click="startStop"
        >
          <v-icon>
            {{ isPlaying ? 'mdi-pause-circle' : 'mdi-play-circle' }}
          </v-icon>
        </v-btn>
        <tempo-chip-color
          :sec="timeElapse"
          :small="false"
          :update-each="5e3"
          :is-active="isPlaying"
          class="mr-2"
          label
          icon
        />
        <slot />
      </div>
    </div>
    <ck
      ref="ck"
      v-model="mmdesc"
      :disabled="checkDisabled"
    />
    <div
      class="d-flex justify-space-between align-top"
    >
      <file-upload
        v-model="files"
        :disabled="checkDisabled"
        :btn-height="53"
      />
      <div
        class="d-flex"
      >
        <situacao-selector
          ref="situacaoSelector"
          v-model="ticket._cdsituacao"
          :rules="[RREQUIRED]"
          :disabled="checkDisabled"
          label="Alterar Situação"
          style="width: 250px"
        />
        <v-btn
          class="primary ml-2"
          dark
          tile
          depressed
          :height="53"
          :disabled="checkDisabled"
          @click="dialog = true"
        >
          salvar
        </v-btn>
      </div>
    </div>
    <v-dialog
      v-model="dialog"
      max-width="600"
    >
      <v-card>
        <v-card-title>
          Selecione Responsável atual do Ticket
        </v-card-title>
        <v-card-text>
          <user-selector
            ref="responsavelSelector"
            v-model="ticket._cdresponsavel"
            prepend-icon=""
            label="Responsável"
            :rules="[RREQUIRED]"
            :multiple="false"
            :force="null"
          />
          <div
            class="d-flex flex-row-reverse"
          >
            <v-btn
              class="teal"
              tile
              depressed
              :disabled="checkDisabled"
              @click="addAcao()"
            >
              <span
                v-if="loadingMessage != null"
              >
                <v-progress-circular
                  indeterminate
                  :size="25"
                  :width="3"
                />
                {{ loadingMessage }}
              </span>
              <span
                v-else
              >
                Adicionar Ação
              </span>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import SituacaoSelector from '@/views/component/BaseSituacaoSelector.vue'
  import FileUpload from '@/views/component/BaseFileUpload.vue'
  import BluePrintInput from '@/views/component/BluePrintInput.vue'
  import Ck from '@/views/component/Ck.vue'
  // import { CustomHttpException } from '@/exception/httpExceptionHandle'
  import UserSelector from '@/views/component/BaseUserSelector.vue'
  import TempoChipColor from '@/views/component/TempoChipColor.vue'

  export default {
    components: {
      Ck,
      UserSelector,
      SituacaoSelector,
      FileUpload,
      BluePrintInput,
      TempoChipColor,
    },

    props: {
      disabled: {
        type: Boolean,
        default: false,
      },
      cdticket: {
        type: Number,
        default: null,
      },
      cdacao: {
        type: Number,
        default: null,
      },
    },

    data () {
      return {
        isPlaying: false,
        dialog: false,
        loadingMessage: null,
        nmassunto: null,
        mmdesc: null,
        files: [],
        timeElapse: null,
        loading: false,
        loadingStopStart: false,
        ticket: {
          _cdsituacao: null,
          _cdreponsavel: null,
        },
      }
    },

    computed: {
      checkDisabled () {
        return this.loading || (this.loadingMessage != null) || !this.isPlaying || this.disabled
      },
    },

    mounted () {
      this.refresh()
    },

    methods: {
      async refresh (force) {
        this.loading = true
        try {
          this.serverTime = await this.$store.dispatch('getServerTime')
          this.ticket = await this.$store.dispatch('getTicket', { cd: this.cdticket, force })
          this.acao = await this.$store.dispatch('getAcaoByCd', { cd: this.cdacao, force })
          const sumAtendimentos = this.$sumAtendimentos(this.acao.cdservico.jslista, this.serverTime)
          this.timeElapse = sumAtendimentos.sum
          this.isPlaying = sumAtendimentos.isIndex
        } finally {
          this.loading = false
          this.loadingMessage = null
        }
      },

      acaoFormValidate () {
        let ret = true;
        [
          'responsavelSelector',
          'nmassuntoInput',
          'situacaoSelector',
        ].forEach(it => {
          if (!this.$refs[it].validate()) {
            ret = false
          }
        }, this)

        if (!ret || !this.mmdesc) {
          return 'Campos obrigatórios não preenchidos'
        }

        if (this.$refs.ck.getDataUsage() > 100) {
          return 'Descrição da Ação ultrapassou limite permitido (900Kb)'
        }

        return null
      },

      async addAcao () {
        const invalidMessage = this.acaoFormValidate()
        if (!invalidMessage) {
          this.loadingMessage = 'Enviando Ação'
          try {
            const acao = await this.$store.dispatch('createAcao', {
              cd: this.cdacao,
              cdticket: this.cdticket,
              cdsituacao: this.ticket._cdsituacao,
              nmassunto: this.nmassunto,
              mmdesc: this.mmdesc,
              cdresponsavel: this.ticket._cdresponsavel,
              cdservico: this.acao._cdservico,
              fgstatus: 1,
              jsanexos: this.files.map(it => {
                return {
                  name: it.name,
                  size: it.size,
                }
              }),
            })
            if (this.files.length > 0) {
              this.loadingMessage = 'Enviando Anexos'
              await this.$store.dispatch('uploadAcaoFiles', {
                files: this.files,
                ticketcd: this.cdticket,
                acaocd: acao.cd,
              })
            }
            // this.cdacao = null
            this.$emit('after-add')
          } catch (err) {
            /*
            if (err instanceof CustomHttpException) {
              this.$notifier({ content: 'Apenas usuários vinculados ao ticket podem adicionar ação', color: 'warning' })
            }
            */
          } finally {
            this.files = []
            this.nmassunto = null
            this.mmdesc = ''
            this.loadingMessage = null
            this.dialog = false
          }
        } else {
          this.$notifier({ content: invalidMessage, color: 'warning' })
        }
      },

      async startStop () {
        try {
          this.loadingStopStart = true
          if (this.isPlaying) {
            await this.$store.dispatch('stopServicoAcao')
            this.isPlaying = false
          } else {
            await this.$store.dispatch('startServicoAcao', this.cdacao)
            this.isPlaying = true
          }
        } finally {
          this.loadingStopStart = false
        }
      },
    },
  }
</script>
