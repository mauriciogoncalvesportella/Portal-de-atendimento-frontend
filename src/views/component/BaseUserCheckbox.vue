<template>
  <v-list
    dense
    subheader
    flat
  >
    <template
      v-if="usersAvaible.length > 0"
    >
      <template
        v-for="user in (mapedUserList || [])"
      >
        <div
          v-if="usersAvaible.includes(user.cd)"
          :key="`div-${user.cd}`"
        >
          <v-divider />
          <v-list-item
            dense
          >
            <div
              class="d-flex justify-space-between align-center flex-grow-1 flex-shrink-0"
            >
              <div
                class="d-flex"
              >
                <v-checkbox
                  v-model="selected"
                  :value="user.cd"
                  :disabled="disabled"
                  color="primary"
                  class="ma-0 pa-0"
                  dense
                  small
                  hide-details
                  @change="$emit('change', selected)"
                />
                <v-icon
                  :color="user.idcolor"
                >
                  mdi-checkbox-blank-circle
                </v-icon>
                <div
                  class="d-flex flex-column ml-2"
                >
                  <v-list-item-title
                    :class="`${usersEnabled.includes(user.cd) ? '' : 'text-decoration-line-through'}`"
                  >
                    {{ user.idnome }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ user.grupoacesso.idnome }}
                  </v-list-item-subtitle>
                </div>
              </div>
              <v-icon
                color="red"
                size="20"
                @click="$emit('remove-user', user.cd)"
              >
                mdi-delete
              </v-icon>
            </div>
          </v-list-item>
        </div>
      </template>
    </template>
    <v-list-item
      v-else
    >
      Nenhum usuário selecionado
    </v-list-item>
  </v-list>
</template>

<script>
  import DependenciesLoad from '@/views/component/BaseDependenciesLoad.vue'
  import { mapGetters } from 'vuex'

  export default {
    name: 'UserCheckbox',
    extends: DependenciesLoad,
    props: {
      usersAvaible: {
        type: Array,
        default: () => [],
      },
      usersEnabled: {
        type: Array,
        default: () => [],
      },
      usersAvaibleCheckbox: {
        type: Array,
        default: () => [],
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        selected: [],
        loading: false,
        dependenciesConfig: {
          route: this.$route.name,
          executeBefore: () => { this.loading = true },
          executeAfter: () => {
            this.loading = false
          },
          dependencies: [{ action: 'userList', mutation: 'SET_USERLIST' }],
        },
      }
    },
    computed: {
      ...mapGetters(['userList', 'user']),
      mapedUserList () {
        const temp = Object.assign([], this.userList)
        if (temp?.length > 0) {
          temp.sort((a, b) => {
            if (a.grupoacesso.idnome > b.grupoacesso.idnome) {
              return 1
            }
            if (a.grupoacesso.idnome < b.grupoacesso.idnome) {
              return -1
            }
            if (a.idnome > b.idnome) {
              return 1
            }
            if (a.idnome < b.idnome) {
              return -1
            }
            return 0
          })
          return temp
        }

        return []
      },
    },
    methods: {
      startSelected (arr) {
        this.selected = arr
      },

      setSelected (arr) {
        this.selected = arr
        this.$emit('change', arr)
      },
    },
  }
</script>
