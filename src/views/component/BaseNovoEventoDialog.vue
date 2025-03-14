<template>
  <v-dialog
    v-model="dialog"
    width="750px"
    scrollable
    :fullscreen="$vuetify.breakpoint.smAndDown"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <span
          class="text-uppercase text-h3 font-weight-light"
        >
          {{ isNewEvent ? 'Novo Evento' : `Editar Evento #${cd}` }}
        </span>
        <v-chip
          class="ml-3"
          light
        >
          <v-switch
            v-model="evento.fgrecorrente"
            label="Recorrente"
            style="height: 26px; text-color: black"
          />
        </v-chip>
        <v-tooltip
          v-if="$store.getters.user.cd === evento._cdresponsavel || cd == null"
          bottom
        >
          <template
            #activator="{ on, attrs }"
          >
            <v-btn
              icon
              class="ml-2"
              :loading="loading"
              v-bind="attrs"
              v-on="on"
              @click="fgcadeadoHandleClick"
            >
              <v-icon>
                {{ evento.fgcadeado ? 'mdi-lock' : 'mdi-lock-open-alert' }}
              </v-icon>
            </v-btn>
          </template>
          {{ evento.fgcadeado ? 'Liberar' : 'Bloquear' }} edição para todos
        </v-tooltip>
        <!--v-btn-toggle
          v-model="evento.fgrecorrente"
          class="ml-2"
          group
          mandatory
        >
          <v-btn
            :value="false"
          >
            Fixo
          </v-btn>
          <v-btn
            :value="true"
          >
            Recorrente
          </v-btn>
        </v-btn-toggle -->
        <v-spacer />
        <v-btn
          icon
          @click="dialog = false"
        >
          <v-icon>
            mdi-close-box
          </v-icon>
        </v-btn>
      </v-toolbar>
      <!--v-card-title
        class="d-flex align-center justify-space-between"
      >
        Evento
        <v-icon
          color="red"
          @click="dialog = false"
        >
          mdi-close-box
        </v-icon>
      </v-card-title-->
      <v-card-text
        :style="$vuetify.breakpoint.smAndDown ? 'height: 800px' : ''"
        class="mt-2"
      >
        <v-row
          dense
        >
          <v-col
            cols="12"
            md="6"
          >
            <blue-print-input
              ref="nmtitulo"
              v-slot="{ errorMessages }"
              v-model="evento.nmtitulo"
              :rules="[RREQUIRED]"
              class="flex-grow-1"
            >
              <!-- Focus https://stackoverflow.com/questions/51472947/vuetifys-autofocus-works-only-on-first-modal-open -->
              <v-text-field
                v-if="dialog"
                v-model="evento.nmtitulo"
                :error-messages="errorMessages"
                prepend-inner-icon="mdi-label"
                label="Título *"
                filled
                dense
                small
                validate-on-blur
                autofocus
                hide-details="auto"
                @focus="$event.target.select()"
              />
            </blue-print-input>
          </v-col>
          <v-col>
            <tipo-agendamento-selector
              ref="cdtipoagendamento"
              v-model="evento.cdtipoagendamento"
              label="Tipo de Agendamento *"
              :rules="[RREQUIRED]"
              @change="changeTipoAgendamento"
            />
          </v-col>
        </v-row>

        <v-row
          v-if="evento.fgrecorrente"
          dense
          justify="center"
        >
          <v-col
            cols="12"
            md="auto"
            class="d-flex justify-center"
          >
            <v-chip
              label
              class="mr-1"
            >
              <v-switch
                v-model="fgmensal"
                label="Mensal"
                @change="disableSwitch('fgsemanal', $event)"
              />
            </v-chip>
            <v-chip
              label
              class="mr-1"
            >
              <v-switch
                v-model="fgsemanal"
                label="Semanal"
                @change="disableSwitch('fgmensal', $event)"
              />
            </v-chip>
            <v-chip
              label
            >
              <v-switch
                v-model="evento.fgdiatodo"
                label="Dia todo"
                :disabled="isLembrete"
                @change="changeDiaTodo"
              />
            </v-chip>
          </v-col>

          <v-col
            v-if="!isLembrete"
            cols="6"
            md="2"
          >
            <blue-print-input
              ref="inicio"
              v-slot="{ errorMessages }"
              v-model="evento.jsrecorrencia.inicio"
              :rules="[RREQUIRED]"
            >
              <v-text-field
                v-model="evento.jsrecorrencia.inicio"
                label="Início"
                :error-messages="errorMessages"
                :disabled="evento.fgdiatodo"
                hide-details="auto"
                type="time"
                dense
                filled
              />
            </blue-print-input>
          </v-col>
          <v-col
            v-if="!isLembrete"
            cols="6"
            md="2"
          >
            <blue-print-input
              ref="fim"
              v-slot="{ errorMessages }"
              v-model="evento.jsrecorrencia.fim"
              :rules="[RREQUIRED]"
            >
              <v-text-field
                v-model="evento.jsrecorrencia.fim"
                type="time"
                label="Fim"
                hide-details="auto"
                :error-messages="errorMessages"
                :disabled="evento.fgdiatodo"
                dense
                filled
              />
            </blue-print-input>
          </v-col>

          <v-col
            cols="12"
          >
            <calendario
              v-if="evento.jsrecorrencia.id === 'mensal'"
              ref="calendario"
              v-model="evento.jsrecorrencia.list"
              style="width: 260px"
              class="mx-auto"
              :rules="[RNOTFALSEPROPERTY]"
            />
            <calendario-semanal
              v-if="evento.jsrecorrencia.id === 'semanal'"
              ref="calendarioSemanal"
              v-model="evento.jsrecorrencia.list"
              :rules="[RNOTFALSEPROPERTY]"
            />
          </v-col>
        </v-row>

        <template
          v-if="!evento.fgrecorrente"
        >
          <v-row
            dense
            justify="center"
          >
            <v-col
              cols="12"
              md="6"
              class="d-flex justify-center"
            >
              <v-chip
                class="mr-2"
                label
              >
                <v-switch
                  v-model="evento.fgconfirmado"
                  label="Confirmado"
                />
              </v-chip>
              <v-chip
                class="mr-2"
                label
              >
                <v-switch
                  v-model="evento.fgcobrarvisita"
                  label="Cobrar visita"
                />
              </v-chip>
            </v-col>

            <v-col
              cols="12"
              md="6"
              class="d-flex justify-center"
            >
              <v-chip
                class="mr-2"
                label
              >
                <v-switch
                  v-model="evento.fgdiatodo"
                  label="Dia todo"
                  :disabled="isLembrete"
                  @change="changeDiaTodo"
                />
              </v-chip>
              <v-chip
                label
              >
                <v-switch
                  v-model="fgdtrealizado"
                  label="Data Realização"
                  :disabled="isLembrete"
                />
              </v-chip>
            </v-col>
          </v-row>

          <v-row
            dense
          >
            <v-col
              cols="12"
              md="6"
            >
              <div
                class="d-flex flex-column flex-grow-1"
              >
                Agendamento início
                <v-divider
                  class="my-1"
                />
                <div
                  class="d-flex"
                >
                  <date-picker
                    ref="dataInicio"
                    v-model="datas.dataInicio"
                    :show-actions="false"
                    :component-props="{
                      filled: true,
                      placeholder: 'Data início *',
                      solo: false,
                    }"
                    :rules="[RREQUIRED]"
                    @change-date="datas.dataFim = $event"
                  />
                  <blue-print-input
                    ref="tempoInicio"
                    v-slot="{ errorMessages }"
                    v-model="datas.tempoInicio"
                    :rules="[RREQUIRED]"
                  >
                    <v-text-field
                      v-if="!isLembrete"
                      v-model="datas.tempoInicio"
                      :error-messages="errorMessages"
                      :disabled="evento.fgdiatodo"
                      hide-details="auto"
                      type="time"
                      class="ml-2"
                      filled
                      small
                      dense
                    />
                  </blue-print-input>
                </div>
              </div>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <div
                class="d-flex flex-column flex-grow-1"
              >
                Agendamento fim
                <v-divider
                  class="my-1"
                />
                <div
                  class="d-flex"
                >
                  <date-picker
                    ref="dataFim"
                    v-model="datas.dataFim"
                    :show-actions="false"
                    :component-props="{
                      filled: true,
                      placeholder: 'Data fim *',
                      solo: false,
                    }"
                    :rules="[RREQUIRED]"
                  />
                  <blue-print-input
                    ref="tempoFim"
                    v-slot="{ errorMessages }"
                    v-model="datas.tempoFim"
                    :rules="[RREQUIRED]"
                  >
                    <v-text-field
                      v-if="!isLembrete"
                      v-model="datas.tempoFim"
                      :error-messages="errorMessages"
                      :disabled="evento.fgdiatodo"
                      hide-details="auto"
                      type="time"
                      class="ml-2"
                      filled
                      small
                      dense
                    />
                  </blue-print-input>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row
            v-if="fgdtrealizado"
            dense
          >
            <v-col
              cols="12"
              md="6"
            >
              <div
                class="d-flex flex-column flex-grow-1"
              >
                Realizado início
                <v-divider
                  class="my-1"
                />
                <div
                  class="d-flex"
                >
                  <date-picker
                    ref="dataRealizadoInicio"
                    v-model="datas.dataRealizadoInicio"
                    :show-actions="false"
                    :component-props="{
                      filled: true,
                      placeholder: 'Data início',
                      solo: false,
                    }"
                    :rules="[RREQUIRED]"
                    @change-date="datas.dataRealizadoFim = $event"
                  />
                  <blue-print-input
                    v-if="!isLembrete"
                    ref="tempoRealizadoInicio"
                    v-slot="{ errorMessages }"
                    v-model="datas.tempoRealizadoInicio"
                    :rules="[RREQUIRED]"
                  >
                    <v-text-field
                      v-if="!isLembrete"
                      v-model="datas.tempoRealizadoInicio"
                      :error-messages="errorMessages"
                      hide-details="auto"
                      class="ml-2"
                      type="time"
                      filled
                      small
                      dense
                    />
                  </blue-print-input>
                </div>
              </div>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <div
                class="d-flex flex-column flex-grow-1"
              >
                Realizado fim
                <v-divider
                  class="my-1"
                />
                <div
                  class="d-flex"
                >
                  <date-picker
                    ref="dataRealizadoFim"
                    v-model="datas.dataRealizadoFim"
                    :show-actions="false"
                    :component-props="{
                      filled: true,
                      placeholder: 'Data fim',
                      solo: false,
                    }"
                    :rules="[RREQUIRED]"
                  />
                  <blue-print-input
                    v-if="!isLembrete"
                    ref="tempoRealizadoFim"
                    v-slot="{ errorMessages }"
                    v-model="datas.tempoRealizadoFim"
                    :rules="[RREQUIRED]"
                  >
                    <v-text-field
                      v-model="datas.tempoRealizadoFim"
                      :error-messages="errorMessages"
                      hide-details="auto"
                      class="ml-2"
                      type="time"
                      filled
                      small
                      dense
                    />
                  </blue-print-input>
                </div>
              </div>
            </v-col>
          </v-row>
        </template>

        <v-row
          dense
        >
          <v-col
            cols="12"
            md="6"
          >
            <v-textarea
              v-model="evento.nmlocal"
              prepend-inner-icon="mdi-map-marker"
              placeholder="Local"
              hide-details="auto"
              rows="4"
              filled
              dense
              small
              validate-on-blur
            />
          </v-col>
          <v-col>
            <v-row
              dense
            >
              <v-col
                cols="12"
              >
                <v-text-field
                  v-model="evento.nmcontato"
                  placeholder="Contato"
                  prepend-inner-icon="mdi-account"
                  hide-details="auto"
                  dense
                  small
                  filled
                />
              </v-col>
              <v-col
                cols="12"
              >
                <v-text-field
                  v-model="evento.idtelefone"
                  placeholder="Telefone"
                  prepend-inner-icon="mdi-phone"
                  hide-details="auto"
                  dense
                  filled
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-row
          dense
        >
          <v-col
            cols="12"
          >
            <blue-print-input
              ref="mmdesc"
              v-slot="{ errorMessages }"
              v-model="evento.mmdesc"
              class="flex-grow-1 flex-shrink-0"
              :rules="[RREQUIRED]"
            >
              <v-textarea
                v-model="evento.mmdesc"
                label="* Descrição do evento"
                :error-messages="errorMessages"
                hide-details="auto"
                filled
                auto-grow
                style="max-height: 500px; overflow: auto;"
              />
            </blue-print-input>
          </v-col>
        </v-row>

        <v-row
          dense
        >
          <v-col
            cols="12"
            md="6"
          >
            <user-selector
              ref="userSelector"
              v-model="evento.users"
              prepend-icon=""
              label="Participantes *"
              :rules="[RREQUIRED]"
              :multiple="true"
              :force="null"
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <chave-selector
              ref="chaveSelector"
              v-model="evento.cdchave"
            />
          </v-col>
        </v-row>

        <div
          class="d-flex justify-end mt-3"
        >
          <template
            v-if="!isNewEvent"
          >
            <v-btn
              color="red"
              dark
              tile
              :loading="loading"
              @click="deleteEvent"
            >
              Excluir
            </v-btn>
            <v-spacer />
          </template>
          <div>
            <v-menu
              v-if="!isNewEvent && !evento.fgrecorrente"
              v-model="menu"
              :close-on-content-click="false"
              offset-y
              max-width="320px"
            >
              <template
                #activator="{ on }"
              >
                <v-btn
                  color="primary"
                  tile
                  text
                  :loading="loading"
                  v-on="on"
                  @click="duplicarDatas = []"
                >
                  Duplicar
                </v-btn>
              </template>
              <v-date-picker
                v-model="duplicarDatas"
                locale="pt-br"
                multiple
                no-title
                scrollable
              >
                <v-btn
                  color="primary"
                  text
                  @click="menu = false"
                >
                  Cancelar
                </v-btn>
                <v-spacer />
                <v-btn
                  tile
                  color="primary"
                  @click="duplicarEvento"
                >
                  Duplicar
                </v-btn>
              </v-date-picker>
            </v-menu>
            <v-btn
              v-if="!isNewEvent && evento.fgrecorrente"
              color="primary"
              class="ml-2"
              tile
              text
              :loading="loading"
              @click="send(true)"
            >
              Fixar
            </v-btn>
            <v-btn
              color="primary"
              class="ml-2"
              tile
              :loading="loading"
              @click="send"
            >
              {{ isNewEvent ? 'Criar' : 'Salvar' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import DatePicker from '@/views/component/BaseDatePicker'
  import UserSelector from '@/views/component/BaseUserSelector'
  import ChaveSelector from '@/views/component/BaseChaveSelector'
  import TipoAgendamentoSelector from '@/views/component/BaseTipoAgendamentoSelector'
  import BluePrintInput from '@/views/component/BluePrintInput'
  import Calendario from '@/views/component/BaseCalendario'
  import CalendarioSemanal from '@/views/component/BaseCalendarioSemanal'
  import { mapGetters } from 'vuex'

  export default {
    components: {
      BluePrintInput,
      DatePicker,
      UserSelector,
      ChaveSelector,
      TipoAgendamentoSelector,
      Calendario,
      CalendarioSemanal,
    },

    props: {
      users: {
        type: Array,
        default: () => [],
      },
    },

    data () {
      return {
        dtRecorrente: null,
        menu: false,
        duplicarDatas: [],
        cd: null,
        isNewEvent: false,
        dialog: false,
        loading: false,
        datas: {
          dataInicio: null,
          tempoInicio: null,
          dataFim: null,
          tempoFim: null,
          dataRealizadoInicio: null,
          tempoRealizadoInicio: null,
          dataRealizadoFim: null,
          tempoRealizadoFim: null,
        },
        evento: {
          nmtitulo: null,
          dtinicio: null,
          dtfim: null,
          dtrealizadoinicio: null,
          dtrealizadofim: null,
          nmlocal: null,
          nmcontato: null,
          idtelefone: null,
          mmdesc: null,
          users: null,
          cdchave: null,
          cdtipoagendamento: null,
          fgdiatodo: true,
          fgconfirmado: false,
          fgcobrarvisita: false,
          fgrecorrente: false,
          fgcadeado: false,
          jsrecorrencia: {
            id: null,
            list: null,
            inicio: null,
            fim: null,
          },
          _cdresponsavel: null,
        },
        diaRecorrencia: [],
        semanaRecorrencia: [],
        fgdtrealizado: false,
        fgsemanal: false,
        fgmensal: true,
      }
    },

    computed: {
      ...mapGetters(['user']),
      isLembrete () {
        return this.evento?.cdtipoagendamento === 1
      },
    },

    methods: {
      changeDiaTodo (fgdiatodo) {
        if (fgdiatodo) {
          if (this.evento.fgrecorrente) {
            this.evento.jsrecorrencia.inicio = '08:00'
            this.evento.jsrecorrencia.fim = '18:00'
          } else {
            this.datas.tempoInicio = '08:00'
            this.datas.tempoFim = '18:00'
          }
        }
      },

      changeTipoAgendamento (cdtipoagendamento) {
        if (cdtipoagendamento) {
          this.fgdtrealizado = false
          this.evento.fgdiatodo = false
          this.evento.jsrecorrencia.inicio = null
          this.evento.jsrecorrencia.fim = null
          for (const key in this.datas) {
            if (key.includes('tempo')) {
              this.datas[key] = null
            }
          }
        }
      },

      disableSwitch (id, val) {
        this[id] = !val
        this.evento.jsrecorrencia.id = this.fgsemanal ? 'semanal' : 'mensal'
        this.evento.jsrecorrencia.list = []
      },

      newEvent (date) {
        this.reset()
        this.isNewEvent = true
        this.datas.dataInicio = date
        this.datas.dataFim = date
        this.evento.users = [this.user.cd]
        this.dialog = true
      },

      openEvent (event) {
        this.isNewEvent = false
        const evento = event.evento
        const generateDates = (data, tempo, date) => {
          if (date) {
            this.datas[data] = this.$moment(date).format('YYYY-MM-DD')
            if (!this.isLembrete) {
              this.datas[tempo] = this.$moment(date).format('HH:mm')
            }
          }
        }
        this.datas.dataInicio = null
        this.reset();
        ['nmtitulo', 'nmlocal', 'nmcontato', 'idtelefone', 'mmdesc', 'fgdiatodo', 'fgconfirmado', 'fgcadeado', 'fgcobrarvisita', 'fgrecorrente', 'jsrecorrencia', '_cdresponsavel'].forEach(key => {
          this.evento[key] = evento[key]
        })
        this.cd = evento.cd
        this.evento.users = evento._cdusers
        this.evento.cdchave = evento._cdchave
        this.evento.cdtipoagendamento = evento._cdtipoagendamento

        if (evento.fgrecorrente) {
          this.dtRecorrente = event.start
          if (evento.jsrecorrencia.id === 'mensal') {
            this.fgmensal = true
            this.fgsemanal = false
          } else {
            this.fgmensal = false
            this.fgsemanal = true
          }
        } else {
          if (evento.dtrealizadofim || evento.dtrealizadoinicio) {
            this.fgdtrealizado = true
          }
          generateDates('dataInicio', 'tempoInicio', evento.dtinicio)
          generateDates('dataFim', 'tempoFim', evento.dtfim)
          if (this.fgdtrealizado) {
            generateDates('dataRealizadoInicio', 'tempoRealizadoInicio', evento.dtrealizadoinicio)
            generateDates('dataRealizadoFim', 'tempoRealizadoFim', evento.dtrealizadofim)
          }
        }

        this.dialog = true
        if (evento.fgrecorrente) {
          this.$nextTick(() => {
            if (evento.jsrecorrencia.id === 'mensal') {
              // eslint-disable-next-line
              this.$refs.calendario?.updateModel()
            } else {
              // eslint-disable-next-line
              this.$refs.calendarioSemanal?.updateModel()
            }
          })
        }
      },

      reset () {
        this.cd = null
        this.fgdtrealizado = null
        for (const key in this.evento) {
          this.evento[key] = null
        }
        for (const key in this.datas) {
          this.datas[key] = null
        }
        this.evento.fgdiatodo = false
        this.evento.fgconfirmado = true
        this.evento.fgcobrarvisita = false
        this.evento.fgrecorrente = false
        this.evento.jsrecorrencia = {
          id: 'mensal',
          list: [],
        }
      },

      validate () {
        let ret = true
        const validateList = (arr) => {
          arr.forEach(id => {
            if (!this.$refs[id].validate()) {
              ret = false
            }
          })
        }

        validateList(['nmtitulo', 'cdtipoagendamento', 'mmdesc', 'userSelector'])
        if (!this.evento.fgrecorrente) {
          validateList(['dataInicio', 'dataFim'])

          if (!this.isLembrete) {
            validateList(['tempoInicio', 'tempoFim'])
          }
          if (this.fgdtrealizado) {
            validateList(['dataRealizadoInicio', 'dataRealizadoFim'])
            if (!this.evento.isLembrete) {
              validateList(['tempoRealizadoInicio', 'tempoRealizadoFim'])
            }
          }
        } else {
          if (this.evento.jsrecorrencia.id === 'mensal') {
            validateList(['calendario'])
          } else {
            validateList(['calendarioSemanal'])
          }
          if (!this.isLembrete) {
            validateList(['inicio', 'fim'])
          }
        }

        return ret
      },

      generateDates () {
        this.dtinicio = null
        this.dtfim = null
        this.dtrealizadoinicio = null
        this.dtrealizadofim = null
        if (!this.evento.fgrecorrente) {
          const generate = (eventKey, data, tempo) => {
            if (!this.isLembrete) {
              this.evento[eventKey] = `${data} ${tempo}`
            } else {
              this.evento[eventKey] = `${data} 00:00`
            }
          }

          generate('dtinicio', this.datas.dataInicio, this.datas.tempoInicio)
          generate('dtfim', this.datas.dataFim, this.datas.tempoFim)
          if (this.fgdtrealizado) {
            generate('dtrealizadoinicio', this.datas.dataRealizadoInicio, this.datas.tempoRealizadoInicio)
            generate('dtrealizadofim', this.datas.dataRealizadoFim, this.datas.tempoRealizadoFim)
          } else {
            this.evento.dtrealizadoinicio = null
            this.evento.dataRealizadoFim = null
          }
        }
      },

      async send (fixar = false) {
        if (this.validate()) {
          this.loading = true
          this.generateDates()

          try {
            const evento = Object.assign({}, this.evento)
            evento.fgcadeado = evento.fgcadeado ?? false
            if (evento.fgrecorrente) {
              delete evento.dtinicio
              delete evento.dtfim
              delete evento.dtrealizadoinicio
              delete evento.dtrealizadofim
            }

            if (fixar === true) {
              await this.$store.dispatch('fixarEvento', {
                cd: this.cd,
                mmdesc: this.mmdesc,
                dtrecorrente: this.dtRecorrente,
              })
            } else if (this.isNewEvent) {
              await this.$store.dispatch('addEvento', evento)
              this.$notifier({ content: 'Evento criado com sucesso', color: 'success' })
            } else {
              evento.cd = this.cd
              await this.$store.dispatch('updateEvento', evento)
              this.$notifier({ content: 'Evento salvo com sucesso', color: 'success' })
            }
            this.$emit('refresh')
          } finally {
            this.loading = false
            this.dialog = false
          }
        }
      },

      async deleteEvent () {
        try {
          var res = await this.$confirm(
            `Confirmação exclusão do Evento #${this.cd}`,
            {
              title: 'Aviso',
              buttonTrueText: 'Excluir',
              buttonFalseText: 'Cancelar',
            },
          )
          if (res) {
            this.loading = true
            this.$store.dispatch('deleteEvento', this.cd)
            this.$emit('refresh')
          }
        } finally {
          this.loading = false
          if (res) {
            this.dialog = false
          }
        }
      },

      async duplicarEvento () {
        try {
          this.loading = true
          await this.$store.dispatch('duplicarEvento', {
            cd: this.cd,
            dates: this.duplicarDatas,
          })
          this.$emit('refresh')
        } finally {
          this.loading = false
          this.menu = false
          this.dialog = false
        }
      },

      async fgcadeadoHandleClick () {
        this.evento.fgcadeado = !this.evento.fgcadeado
      },
    },
  }
</script>
