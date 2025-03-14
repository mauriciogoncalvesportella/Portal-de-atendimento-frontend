<template>
  <div>
    <user-selector
      v-model="userToAdd"
      :multiple="false"
      :users-disabled="UsersAvaible"
      label="Adicionar pessoa"
      @change="addUser"
    />
    <user-checkbox
      ref="userCheckbox"
      :users-avaible="UsersAvaible"
      :users-enabled="UsersInEvents"
      :users-avaible-checkbox="UsersAvaibleCheckbox"
      @change="updateUsersSelected"
      @remove-user="removeUser"
    />
  </div>
</template>

<script>
  import UserCheckbox from '@/views/component/BaseUserCheckbox'
  import UserSelector from '@/views/component/BaseUserSelector'
  import { mapGetters, createNamespacedHelpers } from 'vuex'
  const { mapState } = createNamespacedHelpers('Agenda')

  export default {
    components: {
      UserCheckbox,
      UserSelector,
    },

    data () {
      return {
        userToAdd: null,
      }
    },

    computed: {
      ...mapGetters(['user']),
      ...mapState({
        UsersInEvents: state => state.UsersInEvents,
        UsersAvaible: state => state.UsersAvaible,
        UsersAvaibleCheckbox: state => state.UsersAvaibleCheckbox,
        initialized: state => state.initialized,
      }),
    },

    watch: {
      initialized (val) {
        if (val) {
          this.$refs.userCheckbox.startSelected(this.UsersAvaibleCheckbox)
          this.$emit('change', this.UsersAvaibleCheckbox)
        }
      },
    },

    created () {
      this.$store.dispatch('Agenda/initialize')
    },

    methods: {
      async addUser (usercd) {
        this.userToAdd = null
        if (usercd != null) {
          await this.$store.dispatch('Agenda/add', {
            key: 'UsersAvaible',
            value: usercd,
          })
          await this.$store.dispatch('Agenda/add', {
            key: 'UsersAvaibleCheckbox',
            value: usercd,
          })
          this.$refs.userCheckbox.startSelected(this.UsersAvaibleCheckbox)
          this.$emit('change', this.UsersAvaibleCheckbox)
        }
      },

      async removeUser (usercd) {
        await this.$store.dispatch('Agenda/remove', {
          key: 'UsersAvaible',
          value: usercd,
        })
        await this.$store.dispatch('Agenda/remove', {
          key: 'UsersAvaibleCheckbox',
          value: usercd,
        })
        this.$emit('change', this.UsersAvaibleCheckbox)
        this.$nextTick(() => {
          this.userToAdd = null
        })
      },

      async updateUsersSelected (users) {
        await this.$store.dispatch('Agenda/set', {
          key: 'UsersAvaibleCheckbox',
          value: users,
        })
        this.$emit('change', this.UsersAvaibleCheckbox)
      },

      async updateUsersInEvents (users) {
        await this.$store.dispatch('Agenda/set', {
          key: 'UsersInEvents',
          value: users,
        })
      },
    },
  }
</script>
