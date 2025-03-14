<template>
  <v-row
    dense
    no-gutters
  >
    <base-edit-contato-dialog
      ref="refBaseEditContatoDialog"
    />
    <v-col
      cols="12"
      md="8"
      lg="4"
      class="justify-center"
    >
      <v-row
        dense
        no-gutters
      >
        <v-col
          cols="12"
        >
          <v-text-field
            v-model="text"
            label="Pesquisar"
            filled
            hide-details="auto"
            dense
            append-icon="mdi-magnify"
            @click:append="handleSearch"
            @keyup.enter="handleSearch"
          />
        </v-col>

        <v-col
          cols="12"
        >
          <virtual-list
            class="ma-0"
            data-key="cd"
            :data-sources="rows"
            :data-component="ItemComponent"
            :page-mode="true"
            @tobottom="loadData"
          />
          <v-progress-linear
            v-if="loading"
            indeterminate
            height="5"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
  import VirtualList from 'vue-virtual-scroll-list'
  import BaseChaveContatoRow from '@/views/component/BaseChaveContatoRow'
  import BaseEditContatoDialog from '@/views/component/BaseEditContatoDialog.vue'
  import API from '@/api/'
  import { omitBy, isNil } from 'lodash'

  export default {
    components: {
      BaseEditContatoDialog,
      VirtualList,
    },
    data: () => ({
      selectedItem: 1,
      items: [
        { text: 'Real-Time', icon: 'mdi-clock' },
        { text: 'Audience', icon: 'mdi-account' },
        { text: 'Conversions', icon: 'mdi-flag' },
      ],
      take: 20,
      skip: 0,
      text: '',
      search: '',
      ItemComponent: BaseChaveContatoRow,
      loading: false,
      foneLoading: {
        fone: '',
      },
      rows: [],
    }),
    mounted () {
      this.loadData()
    },
    methods: {
      handleSearch () {
        this.search = this.text
        this.rows = []
        this.take = 20
        this.skip = 0
        this.loadData()
      },

      async loadData () {
        this.loading = true
        try {
          const rows = await API.Chave.allChavesFones(omitBy({
            skip: this.skip,
            take: this.take,
            search: this.search,
          }, isNil))

          for (const row of rows) {
            row.foneLoading = this.foneLoading
            row.deleteFone = this.deleteFone
            row.editFone = this.editFone
            row.createFone = this.createFone
          }

          if (rows.length >= 0) {
            this.skip += rows.length
            this.rows.push(...rows)
          }
        } finally {
          this.loading = false
        }
      },

      async editFone (obj, foneIndex) {
        this.$refs.refBaseEditContatoDialog?.openEdit(obj, foneIndex)
      },

      async createFone (obj) {
        this.$refs.refBaseEditContatoDialog?.openNew(obj)
      },

      async deleteFone (obj, foneIndex) {
        const index = this.rows.findIndex(item => item === obj)
        if (index !== -1) {
          const fone = this.rows[index].chaveFones[foneIndex].fone
          if (fone) {
            try {
              this.foneLoading.fone = this.rows[index].chaveFones[foneIndex].fone
              const res = await this.$confirm(
                `Deletar número de telefone "${fone}"?`,
                {
                  title: 'Aviso',
                  buttonTrueText: 'Confirmar',
                  buttonFalseText: 'Cancelar',
                },
              )
              if (res) {
                await API.Chave.deleteChaveFone(this.rows[index].chaveFones[foneIndex].cd)
                this.rows[index].chaveFones.splice(foneIndex, 1)
              }
            } finally {
              this.foneLoading.fone = ''
            }
          }
        }
      },
    },
  }
</script>
