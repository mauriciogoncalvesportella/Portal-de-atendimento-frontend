<template>
  <v-container
    id="AdminGrupos"
  >
    <v-card
      max-width="890"
      class="mx-auto mt-3"
    >
      <v-card-title
        class="primary white--text text-h5"
      >
        Gerenciar Perfis de Acesso
      </v-card-title>
      <v-row
        no-gutters
      >
        <v-list
          class="pa-0 overflow-y-auto"
          dense
          width="250"
          height="600"
        >
          <v-btn
            text
            tile
            block
            color="primary"
            :loading="novoGrupoLoading"
            @click="addGrupoAcesso"
          >
            Novo Perfil
          </v-btn>
          <v-divider />
          <v-list-item-group
            v-model="model"
            mandatory
            color="primary"
          >
            <v-list-item
              v-for="grupo in grupoAcesso"
              :key="`list-${grupo.idnome}`"
            >
              <v-list-item-icon>
                <v-icon> mdi-card-account-details </v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title v-text="grupo.idnome" />
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-divider vertical />
        <v-col>
          <v-text-field
            v-model="idnome"
            label="Nome do perfil de acesso"
            class="mx-10 mt-4"
          />
          <v-sheet
            class="d-flex-row overflow-y-auto"
            height="600"
          >
            <v-treeview
              v-model="selection"
              :items="items"
              :selection-type="selectionType"
              selectable
              return-object
            >
              <template #[`label`]="{ item }">
                {{ item.label }}
              </template>
            </v-treeview>
          </v-sheet>
          <v-sheet
            class="d-flex-row text-right"
          >
            <v-btn
              tile
              text
              :loading="loading"
              color="primary"
              class="text-right mt-1"
              @click="updateGrupoAcesso"
            >
              <v-icon
                left
              >
                mdi-content-save
              </v-icon>
              Salvar
            </v-btn>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        valid: true,
        grupoAcesso: [],
        novoGrupoLoading: false,
        selectionType: 'independent',
        selection: [],
        model: null,
        idnome: '',
        novoGrupoText: '',
        validNovoGrupo: false,
        loading: false,
        raw: [
          {
            id: 0,
            name: 'atendimento',
            label: 'Atendimento',
          },
          {
            id: 1,
            name: 'tickets',
            label: 'Tickets',
          },
          {
            id: 2,
            name: 'tickets.others',
            label: 'Visualizar todos os Tickets',
          },
          {
            id: 3,
            name: 'tickets.others.rewrite',
            label: 'Controle total',
          },
          {
            id: 4,
            name: 'atendimento.others',
            label: 'Visualizar todos atendimentos',
          },
          {
            id: 5,
            name: 'atendimento.others.rewrite',
            label: 'Alterar atendimentos',
          },
          {
            id: 6,
            name: 'atendimento.handle-queue',
            label: 'Gerenciar Fila de Espera',
          },
          {
            id: 7,
            name: 'clientes',
            label: 'Clientes Commerce',
          },
          {
            id: 8,
            name: 'monitor',
            label: 'Monitor',
          },
          {
            id: 9,
            name: 'monitor.all',
            label: 'Monitorar todos os atendimentos',
          },
          {
            id: 10,
            name: 'monitor.all.resume',
            label: 'Monitorar resumo diário e total',
          },
          {
            id: 11,
            name: 'monitor.all.acoes',
            label: 'Monitorar ações',
          },
          {
            id: 12,
            name: 'monitor.date-control',
            label: 'Controle de datas',
          },
          {
            id: 13,
            name: 'cadastro',
            label: 'Cadastros',
          },
          {
            id: 14,
            name: 'indicadores',
            label: 'Indicadores',
          },
          {
            id: 15,
            name: 'admin',
            label: 'Administração',
          },
          {
            id: 16,
            name: 'agenda',
            label: 'Agenda',
          },
          {
            id: 17,
            name: 'agenda.all',
            label: 'Monitorar agenda de todos',
          },
        ],
        items: [],
      }
    },

    watch: {
      // Olá Léo do futuro, sou o Léo do passado, me desculpe por escrever esse código de difícil manutenção
      selection (newValue, oldValue) {
        if (newValue.length > oldValue.length) {
          const items = newValue
          const length = items.length
          if (length) {
            const index = length - 1
            const arr = items[index].name.split('.')
            arr.pop()
            for (let i = 1; i <= arr.length; i++) {
              const key = arr.slice(0, i).join('.')
              const find = this.selection.find(it => {
                return it.name === key
              })

              if (!find) {
                this.selection.push(this.raw.find(it => it.name === key))
              }
            }
          }
        } else if (oldValue.length > newValue.length) {
          const difference = oldValue.filter(it => !newValue.includes(it))[0]
          this.selection = this.selection.filter(it => !it.name.includes(difference.name))
        }
      },
      model (value) {
        if (value >= 0) {
          this.selection = []
          const grupo = this.grupoAcesso[value]
          for (const role of grupo.jsroles) {
            const item = this.raw.find(it => it.name === role)
            this.selection.push(item)
          }
          this.idnome = this.grupoAcesso[value].idnome
        }
      },
    },

    created () {
      this.transformRaw2Tree()
      this.refresh()
    },

    mounted () {
      this.selection = [
        {
          id: 2,
          name: 'atendimento.others',
        },
      ]
    },

    methods: {
      pushTree (tree, leaf, keys, cont) {
        if (cont === keys.length) {
          tree.push(leaf)
        } else {
          const key = keys.slice(0, cont).join('.')
          const targetTree = tree.find(it => it.name === key)
          if (!targetTree.children) {
            targetTree.children = []
          }
          this.pushTree(targetTree.children, leaf, keys, cont + 1)
        }
      },

      transformRaw2Tree () {
        const bucket = {}
        let maxSize = 0
        for (const item of this.raw) {
          const size = item.name.split('.').length
          if (!bucket[size]) {
            bucket[size] = []
          }
          bucket[size].push(item)
          maxSize = Math.max(maxSize, size)
        }

        for (let i = 1; i <= maxSize; i++) {
          for (const item of bucket[i]) {
            const vetKeys = item.name.split('.')
            this.pushTree(this.items, item, vetKeys, 1)
          }
        }
      },

      async refresh (force = false) {
        this.grupoAcesso = await this.$store.dispatch('allGrupoAcesso', force)
      },

      async addGrupoAcesso () {
        const findIndex = this.grupoAcesso.findIndex(it => it.idnome === 'Novo Perfil de Acesso')

        if (findIndex >= 0) {
          this.model = findIndex
        } else {
          const grupoAcesso = {
            // idnome: this.novoGrupoText,
            idnome: 'Novo Perfil de Acesso',
            idicon: 'mdi-account',
            jsroles: [],
          }

          try {
            this.novoGrupoLoading = true
            await this.$store.dispatch('addGrupoAcesso', grupoAcesso)
            await this.refresh(true)
            this.model = this.grupoAcesso.length - 1
          } finally {
            this.novoGrupoLoading = false
          }
        }
      },

      async updateGrupoAcesso () {
        try {
          this.loading = true
          const grupoAcesso = this.grupoAcesso[this.model]
          grupoAcesso.idnome = this.idnome
          grupoAcesso.jsroles = this.selection.map(it => it.name)
          delete grupoAcesso.dtcriacao
          await this.$store.dispatch('addGrupoAcesso', grupoAcesso)
          await this.refresh(true)
          this.$notifier({ content: 'Perfil salvo com sucesso', color: 'success' })
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>
