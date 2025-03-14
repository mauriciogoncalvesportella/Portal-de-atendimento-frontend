<template>
  <v-sheet
    class="d-flex flex-column"
  >
    <div
      style="min-height: 250px; max-height: 600px; width: 300px"
      class="overflow-y-auto my-auto"
    >
      <v-treeview
        v-model="model"
        selection-type="leaf"
        selectable
        :items="items"
        @input="changeSelected"
      />
    </div>
    <v-btn
      tile
      @click="$emit('filter')"
    >
      <v-icon
        left
      >
        mdi-window-minimize
      </v-icon>
      Fechar
    </v-btn>
  </v-sheet>
</template>

<script>
  export default {
    data () {
      return {
        initialItems: [],
        items: [],
        model: [],
        pessoas: null,
        urgencia: null,
        motivo: null,
        keys: [],
        solo: {},
        total: {},
      }
    },

    created () {
      this.refresh()
    },

    mounted () {
      this.changeSelected()
    },

    methods: {
      async refresh () {
        this.items = []
        let users
        if (this.$checkRole('tickets.others')) {
          users = await this.$store.dispatch('userList', { mutex: false, force: false })
        }
        const allMeta = await this.$store.dispatch('allMeta')
        const motivo = allMeta.motivo
        const urgencia = allMeta.urgencia.sort((a, b) => a.nordem - b.nordem)
        const situacao = allMeta.situacao.sort((a, b) => a.nordem - b.nordem)

        this.makeItem('ticketsdia', 'Apenas Tickets do Dia', null)
        this.makeItem('fgticket', 'Tipo do Ticket', 'name', [{ cd: 0, name: 'Público' }, { cd: 1, name: 'Interno' }])
        if (this.$checkRole('tickets.others')) {
          this.makeItem('users', 'Vincular pessoas', 'idnome', users)
        }
        this.makeItem('motivo', 'Motivos', 'nmmotivo', motivo)
        this.makeItem('urgencia', 'Urgencias', 'nmurgencia', urgencia)
        this.makeItem('situacao', 'Situação', 'nmsituacao', situacao)
        this.model = this.model.filter(it => it !== 'situacao_4')
      },

      makeItem (id, name, itemKeyName, arr) {
        this.keys.push(id)
        let item
        if (arr) {
          item = {
            id,
            name,
            children: [],
          }
          for (const curr of arr) {
            const itemId = `${id}_${curr.cd}`

            this.total[id] = this.total[id] || 0
            this.total[id]++

            this.model.push(itemId)
            item.children.push({
              id: itemId,
              name: curr[itemKeyName],
            })
          }
        } else {
          this.solo[id] = true
          this.model.push(id)
          item = {
            id,
            name,
          }
        }
        this.items = this.items.concat(item)
      },

      changeSelected () {
        const acc = {}
        const count = {}
        for (const key of this.keys) {
          acc[key] = this.solo[key] ? false : []
        }

        for (const curr of this.model) {
          if (this.solo[curr]) {
            acc[curr] = true
          } else {
            const [key, cd] = curr.split('_')
            count[key] = count[key] || 0
            count[key]++

            if (count[key] >= this.total[key] && acc[key]) {
              delete acc[key]
            } else {
              acc[key].push(parseInt(cd))
            }
          }
        }

        if (acc != null) {
          this.$emit('input', acc)
          // this.$emit('after-change', acc)
        }
      },
    },
  }
</script>
