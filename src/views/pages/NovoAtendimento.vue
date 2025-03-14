<template>
  <v-container
    id="NovoAtendimento"
    class="mb-12"
    style="max-width: 1500px"
  >
    <v-row
      class="mx-lg-12"
    >
      <v-col
        cols="12"
        sm="12"
        md="5"
      >
        <v-card
          class="mb-5"
        >
          <v-card-title class="headline">
            Categoria Ticket
            <v-spacer />
            <v-chip
              small
            >
              ID: {{ props.uuid }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-btn-toggle
              v-model="fgticket"
              class="w-100"
              tile
              mandatory
              color="primary"
              group
            >
              <v-btn
                :disabled="isLoading"
                value="0"
              >
                Pública
              </v-btn>

              <v-btn
                :disabled="isLoading"
                value="1"
              >
                Interna
              </v-btn>
            </v-btn-toggle>
          </v-card-text>
        </v-card>
        <v-card
          class="mb-5"
        >
          <v-card-title class="headline" />
          <v-card-text>
            <v-row>
              <v-col
                cols="10"
              >
                <solicitante-selector
                  ref="solicitanteSelector"
                  v-model="solicitante"
                  :disabled="isLoading"
                  :rules="[RREQUIRED]"
                  :cdchave="props.cdchave"
                />
              </v-col>
              <v-col
                cols="2"
              >
                <novo-solicitante-pop-over
                  :cdchave="props.cdchave"
                  :disabled="isLoading"
                  @afterAdd="afterAddSolicitante"
                />
              </v-col>
            </v-row>
            <v-divider class="my-4" />
            <v-row no-gutters>
              <v-col
                cols="12"
              >
                <motivo-selector
                  ref="motivoSelector"
                  v-model="cdmotivo"
                  :disabled="isLoading"
                  :rules="[RREQUIRED]"
                />
              </v-col>
            </v-row>
            <v-divider class="my-4" />
            <v-row no-gutters>
              <v-col
                cols="12"
              >
                <v-autocomplete
                  v-model="cdsistema"
                  :items="sistema"
                  :disabled="isLoading"
                  label="Sistema"
                  prepend-icon="mdi-database-search"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-chip
                label
                class="ma-1"
              >
                <v-icon left>
                  mdi-application
                </v-icon>
                Commerce: {{ chave.idversaoexe | checkVoid }}
              </v-chip>
              <v-chip
                label
                class="ma-1"
              >
                <v-icon left>
                  mdi-database
                </v-icon>
                Firebird: {{ chave.idversaodb | checkVoid }}
              </v-chip>

              <v-chip
                label
                class="ma-1"
              >
                <v-icon left>
                  mdi-clock-alert
                </v-icon>
                {{ chave.dtvalidade | str2calendar }}
              </v-chip>
            </v-row>
            <v-divider class="my-4" />
            <v-row>
              <v-col
                cols="6"
                md="12"
                lg="6"
              >
                <situacao-selector
                  ref="situacaoSelector"
                  v-model="cdsituacao"
                  :rules="[RREQUIRED]"
                  :disabled="isLoading"
                />
              </v-col>
              <v-col
                cols="6"
                md="12"
                lg="6"
              >
                <urgencia-selector
                  ref="urgenciaSelector"
                  v-model="cdurgencia"
                  :rules="[RREQUIRED]"
                  :disabled="isLoading"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title class="headline">
            Vincular Pessoas
          </v-card-title>
          <v-card-text>
            <user-selector
              v-model="users"
              :force="user.cd"
              :disabled="isLoading"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        sm="12"
        md="7"
      >
        <v-card>
          <v-card-title class="headline">
            Adicionar Ação
          </v-card-title>
          <v-card-text>
            <blue-print-input
              ref="nmassuntoInput"
              v-slot="{ errorMessages }"
              v-model="nmassunto"
              :rules="[RREQUIRED]"
            >
              <v-text-field
                v-model="nmassunto"
                label="Assunto"
                prepend-icon="mdi-label"
                :disabled="isLoading"
                :error-messages="errorMessages"
              />
            </blue-print-input>
            <ck
              ref="ck"
              v-model="mmdesc"
            />
            <file-upload
              v-model="files"
              class="mt-2"
            />
          </v-card-text>
        </v-card>
        <v-btn
          class="primary mt-3"
          tile
          depressed
          :disabled="isLoading"
          :loading="isLoading"
          @click="send"
        >
          <span v-if="isLoading">
            {{ loadingMessage }}
          </span>
          <span v-else>
            Salvar
          </span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
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
  import Ck from '@/views/component/Ck.vue'
  import { mapGetters } from 'vuex'

  export default {
    name: 'NovoAtendimento',
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
    },
    props: {
      props: {
        type: Object,
        default: () => {},
      },
    },
    data () {
      return {
        valid: true,
        cdticket: null,
        mmdesc: '',
        solicitante: {},
        fgticket: 0,
        chave: {
          idversaodb: '?',
          idversaoexe: '?',
          dtvalidade: '?',
          dtatualizacao: '?',
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
        users: [],
        files: [],
        nmassunto: null,
        loadingMessage: null,
        assuntoErrorMessage: null,
      }
    },

    computed: {
      ...mapGetters(['user']),
      ticketDTO: function () {
        return {
          fgticket: parseInt(this.fgticket),
          cdsistema: this.cdsistema,
          cdsituacao: this.cdsituacao,
          cdurgencia: this.cdurgencia,
          cdmotivo: this.cdmotivo,
          cdatendimento: this.props.cdatendimento,
          cdsolicitante: this.solicitante.cd,
          users: this.users,
        }
      },

      acaoDTO: function () {
        return {
          cdticket: this.cdticket,
          nmassunto: this.nmassunto,
          mmdesc: this.mmdesc,
          jsanexos: this.files.map(it => {
            return {
              name: it.name,
              size: it.size,
            }
          }),
        }
      },

      isLoading: function () {
        return this.loadingMessage !== null
      },
    },

    created () {
      this.loadChave()
      this.users = [this.user.cd]
    },

    methods: {
      formValidate () {
        let ret = true;
        [
          'motivoSelector',
          'situacaoSelector',
          'solicitanteSelector',
          'urgenciaSelector',
          'nmassuntoInput',
        ].forEach(it => {
          if (!this.$refs[it].validate()) {
            ret = false
          }
        }, this)

        if (!ret) {
          throw new Error('Campos obrigatórios não preenchidos')
        }

        if (this.$refs.ck.getDataUsage() > 100) {
          throw new Error('Descrição da Ação ultrapassou limite permitido (900Kb)')
        }
      },

      afterAddSolicitante (cd) {
        this.$refs.solicitanteSelector.newValue(cd)
      },

      async loadChave () {
        const data = await this.$store.dispatch('allChaves')
        this.chave = data.find(item => item.cd === this.props.cdchave)
      },

      async send () {
        this.formValidate()
        this.loadingMessage = 'Criando Ticket'
        const { ticket, acao } = await this.$store.dispatch('createTicketAcao', {
          ticket: this.ticketDTO,
          acao: this.acaoDTO,
        })
        if (this.files.length > 0) {
          this.loadingMessage = 'Carregando anexos'
          await this.$store.dispatch('uploadAcaoFiles', {
            files: this.files,
            ticketuuid: ticket.uuid,
            acaouuid: acao.uuid,
          })
        }
        this.loadingMessage = null
      },
    },
  }
</script>

<style>
  .ck-content {
    height: 300px;
  }
</style>
