<template>
  <v-autocomplete
    v-model="model"
    :loading="false"
    :items="filteredUserList"
    :disabled="disabled"
    :prepend-inner-icon="prependIcon"
    :error-messages="errMsg"
    :class="!errMsg ? 'mb-2' : ''"
    no-data-text="Não encontrado"
    hide-details="auto"
    dense
    small
    filled
    :label="label"
    :multiple="multiple"
    validate-on-blur
    @change="$emit('input', model); $emit('change', model)"
  >
    <template v-slot:selection="data">
      <v-chip
        v-if="data.item.value === -1"
      >
        Todos
      </v-chip>
      <user-initials-avatar
        v-else
        class="pa-1"
        :cduser="data.item.value"
      />
    </template>
  </v-autocomplete>
</template>

<script>
  import UserInitialsAvatar from '@/views/component/BaseUserInitialsAvatar'
  import BluePrintValidate from '@/views/component/BluePrintValidate.vue'
  export default {
    components: {
      UserInitialsAvatar,
    },
    extends: BluePrintValidate,
    props: {
      value: {
        type: [Number, Array],
        default: () => null,
      },
      multiple: {
        type: Boolean,
        default: true,
      },
      force: {
        type: Array,
        default: () => [],
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      prependIcon: {
        type: String,
        default: '',
      },
      allOption: {
        type: Boolean,
        default: false,
      },
      label: {
        type: String,
        default: 'Vincular Pessoas',
      },
      usersDisabled: {
        type: Array,
        default: null,
      },
    },

    data () {
      return {
        loading: false,
        userList: [],
      }
    },

    computed: {
      filteredUserList () {
        if (this.usersDisabled) {
          return this.userList.filter(it => !this.usersDisabled.includes(it.value) || (this.allOption && it.value === -1))
        }
        return this.userList
      },
    },

    watch: {
      model: function () {
        this.forceSelectArray()
      },

      value (newValue) {
        this.model = newValue
      },

      force: function () {
        this.forceSelectArray()
      },
    },

    mounted () {
      this.refresh()
    },

    methods: {
      forceSelectArray () {
        if (this.force?.length > 0 && this.multiple) {
          for (const usercd of this.force) {
            const find = this.model.filter(item => item === usercd)
            if (find.length === 0) {
              this.model.unshift(usercd)
            }
          }
        }
      },

      async newValue (val) {
        this.model = val
      },

      async refresh () {
        try {
          this.userList = await this.$store.dispatch('userList', { force: false, mutex: false })
          this.userList = this.$raw2select(this.userList, 'cd', 'idnome')
          if (this.allOption) {
            this.userList.unshift({
              text: 'Todos',
              value: -1,
            })
          }
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>
