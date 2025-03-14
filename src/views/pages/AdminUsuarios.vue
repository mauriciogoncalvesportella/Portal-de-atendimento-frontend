<template>
  <v-container
    id="AdminUsuarios"
  >
    <v-row
      justify="center"
    >
      <v-col
        cols="12"
        md="10"
        lg="8"
        xl="6"
      >
        <v-card>
          <v-card-title
            class="d-flex justify-space-between primary white--text text-h5"
          >
            <span>
              Usuários
            </span>
            <novo-usuario
              @userCreated="userCreated"
            />
          </v-card-title>
          <v-card
            flat
            tile
            class="d-flex"
          >
            <v-card
              flat
              tile
              class="overflow-y-auto"
              width="350"
              height="600"
            >
              <v-treeview
                :items="items"
                activatable
                open-all
                open-on-click
                active-class="text-weigth-bold"
                dense
                @update:active="treeViewUpdate"
              >
                <template #[`prepend`]="{ item }">
                  <user-initials-avatar
                    v-if="!item.children"
                    :cduser="item.id"
                  />
                  <!--v-avatar
                    v-if="!item.children"
                    color="blue darken-4"
                    size="30"
                  >
                    <span class="white--text text-overline">
                      {{ item.idnome | extractInitials }}
                    </span>
                  </v-avatar-->
                  <!--v-icon v-if="!item.children">
                    mdi-account
                  </v-icon-->
                </template>
              </v-treeview>
            </v-card>
            <v-divider vertical />
            <v-card
              tile
              flat
              width="100%"
              class="d-flex justify-center align-center"
            >
              <template
                v-if="userSelected"
              >
                <v-sheet
                  width="80%"
                >
                  <v-form
                    ref="form"
                    v-model="userSelected.valid"
                  >
                    <v-card-text class="ma-0">
                      <v-text-field
                        v-model="userSelected.idlogin"
                        label="Login"
                        prepend-icon="mdi-account-circle"
                        :rules="[ RREQUIRED, RMIN(5), RNOSPECIAL ]"
                        :disabled="loading"
                        filled
                      />

                      <v-text-field
                        v-model="userSelected.idnome"
                        label="Nome"
                        prepend-icon="mdi-account-details"
                        :rules="[ RREQUIRED ]"
                        :disabled="loading"
                        filled
                      />

                      <grupo-acesso-selector
                        v-model="userSelected.grupoacesso.cd"
                      />

                      <v-text-field
                        v-model="userSelected.idemail"
                        label="Email"
                        prepend-icon="mdi-card-account-mail"
                        :rules=" [ RREQUIRED, REMAIL ]"
                        :disabled="loading"
                        type="email"
                        filled
                      />

                      <v-menu
                        v-model="menu"
                        :close-on-content-click="false"
                        min-height="400"
                      >
                        <template #activator="{ on }">
                          <v-text-field
                            v-model.lazy="userSelected.idcolor"
                            label="Código cor"
                            prepend-icon="mdi-palette"
                            filled
                            readonly
                            validate-on-blur
                            v-on="on"
                          >
                            <template #append>
                              <v-icon
                                size="15"
                                :color="userSelected.idcolor"
                                right
                              >
                                mdi-checkbox-blank-circle
                              </v-icon>
                            </template>
                          </v-text-field>
                        </template>
                        <v-sheet
                          class="pa-3"
                        >
                          <v-color-picker
                            v-model="modelColorPicker"
                            class="mx-auto"
                            hide-inputs
                            mode="hexa"
                          />
                          <div
                            class="d-flex justify-end"
                          >
                            <v-btn
                              tile
                              color="primary"
                              @click="menu = false; userSelected.idcolor = modelColorPicker.hexa"
                            >
                              Salvar
                            </v-btn>
                          </div>
                        </v-sheet>
                      </v-menu>

                      <div
                        class="d-flex justify-space-around"
                      >
                        <div
                          v-for="(turno, i) in userSelected.jsturnos"
                          :key="`turno-${i}`"
                          class="d-flex flex-column font-weight-light"
                        >
                          {{ i === 0 ? 'Primeiro' : 'Segundo' }} turno
                          <v-divider />
                          <div
                            class="d-flex"
                          >
                            <v-text-field
                              v-model="turno.dtinicio"
                              type="time"
                              class="mr-1"
                              dense
                            />
                            <v-text-field
                              v-model="turno.dtfim"
                              type="time"
                              class="ml-1"
                              dense
                            />
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                    <v-card-actions
                      class="ma-0"
                    >
                      <alterar-senha
                        :disabled="loading"
                        :cd="userSelected.cd"
                      />
                      <v-spacer />
                      <v-btn
                        text
                        :disabled="!userSelected.valid || userSelected.disabled || !checkTurnos"
                        :loading="loading"
                        color="green"
                        @click="update"
                      >
                        Salvar
                      </v-btn>
                    </v-card-actions>
                  </v-form>
                </v-sheet>
              </template>
              <span
                v-else
                class="d-block text-h6 text-h4 grey--text text--lighten-1 font-weight-light text-overline"
              >
                Selecione um usuário no menu lateral
              </span>
            </v-card>
          </v-card>
        </v-card>
      </v-col>
      <!--v-col
        cols="6"
      >
        <novo-usuario
          @send="refresh(true)"
        />
      </v-col-->
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'AdminUsuarios',
    components: {
      UserInitialsAvatar: () => import('@/views/component/BaseUserInitialsAvatar'),
      NovoUsuario: () => import('../component/BaseNovoUsuarioModal.vue'),
      AlterarSenha: () => import('../component/BasePasswordPopOver.vue'),
      GrupoAcessoSelector: () => import('@/views/component/BaseGrupoAcessoSelector.vue'),
    },

    data () {
      return {
        modelColorPicker: null,
        menu: false,
        filters: null,
        users: [],
        items: [],
        active: [],
        userSelectedCd: null,
        loading: false,
        userSelected: null,
      }
    },

    computed: {
      checkTurnos () {
        return this.userSelected?.jsturnos[0]?.dtinicio &&
          this.userSelected?.jsturnos[0]?.dtfim &&
          this.userSelected?.jsturnos[1]?.dtinicio &&
          this.userSelected?.jsturnos[1]?.dtfim
      },
    },

    watch: {
      userSelectedCd (val) {
        if (val) {
          this.userSelected = {}
          Object.assign(
            this.userSelected,
            this.users.find(it => it.cd === val),
          )
        } else {
          this.userSelected = null
        }
      },
    },

    created () {
      this.refresh()
    },

    methods: {
      async refresh (force = false) {
        const data = await this.$store.dispatch('userList', { mutex: false, force: force })
        this.users = data.map(da => {
          return {
            ...da,
            jsturnos: da.jsturnos || [{ dtinicio: '08:00', dtfim: '12:00' }, { dtinicio: '13:15', dtfim: '18:00' }],
            valid: true,
            idcolor: da.idcolor || '#FFFFFFFF',
            disabled: (da.grupoacesso.jsroles.includes('admin') && this.$store.getters.user.cd !== da.cd),
          }
        })

        const grupo = {}
        let idGgroupCount = 0
        for (const user of data) {
          const idnome = user.grupoacesso.idnome
          if (!grupo[user.grupoacesso.idnome]) {
            grupo[idnome] = {
              id: idGgroupCount++,
              name: idnome,
              children: [],
            }
          }
          grupo[idnome].children.push({
            id: user.cd,
            name: user.idlogin,
            idnome: user.idnome,
          })
        }
        this.items = []
        for (const key of Object.keys(grupo)) {
          this.items.push(grupo[key])
        }
      },

      async update () {
        this.loading = true
        const user = {}
        Object.assign(user, this.userSelected)
        user.grupoacesso = user.grupoacesso.cd
        try {
          await this.$store.dispatch('userUpdate', user)
          this.$notifier({ content: 'Usuário atualizado com sucesso' })
          this.refresh(true)
        } finally {
          this.loading = false
        }
      },

      treeViewUpdate (val) {
        if (val.length > 0 && val[0]) {
          this.userSelectedCd = val[0]
        } else {
          this.userSelectedCd = null
        }
      },

      async userCreated (val) {
        await this.refresh(true)
        this.userSelectedCd = val.cd
      },
    },
  }
</script>
