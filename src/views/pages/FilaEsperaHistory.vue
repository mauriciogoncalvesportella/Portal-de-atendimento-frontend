<template>
  <v-row
    dense
  >
    <v-col>
      <span
        class="text-overline"
      >
        Filtros
      </span>
    </v-col>
    <v-col
      cols="12"
      class="d-flex"
    >
      <v-row
        dense
        align="center"
      >
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="filter.date"
            label="data"
            type="date"
            filled
            hide-details="auto"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <chave-selector
            ref="chaveSelector"
            v-model="filter.cdchave"
            :rules="[RREQUIRED]"
            @change="filter.solicitante = null"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <solicitante-selector
            ref="solicitanteSelector"
            v-model="filter.solicitante"
            :disabled="filter.cdchave == null"
            :cdchave="filter.cdchave"
            :rules="[RREQUIRED]"
          />
        </v-col>
        <v-col
          cols="12"
          class="d-flex justify-end"
        >
          <v-btn
            depressed
            tile
            class="mr-2"
            @click="clearFilter"
          >
            Limpar
          </v-btn>
          <v-btn
            depressed
            dark
            tile
            color="primary"
            @click="loadData(true)"
          >
            <v-icon
              left
            >
              mdi-magnify
            </v-icon>
            Buscar
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
    <v-col
      cols="12"
    >
      <v-divider
        class="mt-2"
      />
    </v-col>
    <v-col
      cols="12"
    >
      <virtual-list
        :data-key="'cd'"
        :data-sources="rows"
        :data-component="ItemComponent"
        :page-mode="true"
        @tobottom="loadData"
      />
      <v-progress-linear
        v-if="loading.getAll"
        indeterminate
        height="5"
      />
      <span
        v-if="loaded || !rows.length"
        class="d-flex flex-grow-1 flex-shrink-0 justify-center text-button"
      >
        Fim da lista
      </span>
    </v-col>
  </v-row>
</template>

<script>
  import { mapState } from 'vuex'
  import VirtualList from 'vue-virtual-scroll-list'
  import FilaEsperaRow from '@/views/component/BaseFilaEsperaRow'
  import { omitBy, isNil } from 'lodash'

  export default {
    components: {
      VirtualList,
      ChaveSelector: () => import('@/views/component/BaseChaveSelector'),
      SolicitanteSelector: () => import('@/views/component/BaseSolicitanteSelector.vue'),
    },
    data: () => ({
      ItemComponent: FilaEsperaRow,
      rows: [],
      loaded: false,
      headers: [
        { text: 'cd', align: 'center', filterable: true, value: 'cd' },
        { text: 'Id. Fantasia', align: 'center' },
      ],
      getAllDTO: {
        take: 50,
        skip: 0,
      },
      filter: {
        cdchave: null,
        solicitante: null,
        date: null,
      },
    }),

    computed: {
      ...mapState('FilaEspera', ['loading']),
    },

    watch: {
    },

    created () {
      setTimeout(this.loadData, 300)
      this.$store.subscribeAction({
        after: (action) => {
          if (action.type === 'FilaEspera/remove') {
            this.remove(action.payload)
          }
        },
      })
    },

    methods: {
      clearFilter () {
        for (const key in this.filter) {
          this.filter[key] = null
        }
      },

      async loadData (force = false) {
        if (this.filter.date === '') {
          this.filter.date = null
        }
        if (force) {
          this.rows = []
          this.getAllDTO = {
            take: 30,
            skip: 0,
          }
        }
        const filter = omitBy({
          ...this.getAllDTO,
          ...this.filter,
          cdsolicitante: this.filter?.solicitante?.cd,
        }, isNil)
        delete filter.solicitante
        const rows = await this.$store.dispatch('FilaEspera/getAll', filter)
        if (rows.length) {
          this.getAllDTO.skip += this.getAllDTO.take
          this.rows.push(...rows)
          this.loaded = false
        } else {
          this.loaded = true
        }
      },

      async remove (cd) {
        const index = this.rows.findIndex(item => item.cd === cd)
        if (index >= 0) {
          this.rows.splice(index, 1)
        }
      },
    },
  }
</script>
