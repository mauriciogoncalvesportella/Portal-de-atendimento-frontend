<template>
  <v-tooltip
    bottom
  >
    <template
      #activator="{ on, attrs }"
    >
      <v-avatar
        :color="userColor"
        :size="size"
        v-bind="attrs"
        v-on="on"
      >
        <span
          class="white--text text-overline"
        >
          {{ idnome | extractInitials }}
        </span>
      </v-avatar>
    </template>
    <span>
      {{ idnome }}
    </span>
  </v-tooltip>
</template>

<script>
  import { mapGetters } from 'vuex'
  export default {
    props: {
      cduser: {
        type: Number,
        default: null,
      },
      color: {
        type: String,
        default: null,
      },
      size: {
        type: Number,
        default: 30,
      },
    },
    computed: {
      ...mapGetters(['userMap']),
      idnome () {
        if (this.cduser && this.userMap) {
          return this.userMap[this.cduser].idnome
        }
        return '?'
      },
      userColor () {
        if (this.color) {
          return this.color
        }

        if (this.cduser && this.userMap) {
          return this.userMap[this.cduser].idcolor
        }

        return 'blue darken-4'
      },
    },
    mounted () {
      if (!this.userMap) {
        this.$store.dispatch('userMap')
      }
    },
  }
</script>
