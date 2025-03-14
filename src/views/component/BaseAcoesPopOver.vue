<template>
  <v-menu
    v-model="menu"
    :close-on-click="true"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ on }">
      <v-chip
        v-on="on"
      >
        {{ acoes.length }}
      </v-chip>
    </template>
    <v-data-table
      :headers="headers"
      :items="acoes"
      disable-pagination
      disable-sort
      hide-default-footer
    >
      <template v-slot:top>
        <div
          class="d-flex justify-end align-center grey lighten-4"
        >
          <div
            class="red accent-4"
          >
            <v-icon
              color="white"
              @click="menu = false"
            >
              mdi-close
            </v-icon>
          </div>
        </div>
      </template>
      <template v-slot:item._cduser="{ value }">
        <user-initials-avatar
          :cduser="value"
        />
      </template>

      <template v-slot:item.dtcriacao="{ value }">
        {{ value | str2datetime('DD/MM/YYYY HH:mm') }}
      </template>
    </v-data-table>
  </v-menu>
</template>

<script>
  import UserInitialsAvatar from '@/views/component/BaseUserInitialsAvatar'
  export default {
    components: {
      UserInitialsAvatar,
    },
    props: {
      acoes: {
        type: Array,
        default: () => [],
      },
    },

    data () {
      return {
        menu: false,
        headers: [
          { value: '_cduser', text: 'Pessoa' },
          { value: 'nmassunto', text: 'Assunto' },
          { value: 'dtcriacao', text: 'Data' },
        ],
      }
    },

    created () {
      this.acoes.sort((a, b) => new Date(b.dtcriacao) - new Date(a.dtcriacao))
    },
  }
</script>
