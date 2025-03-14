<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :activator="`#${$store.state.Tema.cssId}`"
    bottom
    content-class="v-settings"
    left
    nudge-left="8"
    offset-x
    origin="top right"
    transition="scale-transition"
  >
    <v-card
      class="text-center mb-0"
      width="300"
    >
      <v-card-text>
        <v-item-group
          v-model="color"
        >
          <v-item
            v-for="color in colors"
            :key="color"
            :value="color"
          >
            <template v-slot="{ active, toggle }">
              <v-avatar
                :class="active && 'v-settings__item--active'"
                :color="color"
                class="v-settings__item"
                size="25"
                @click="toggle"
              />
            </template>
          </v-item>
        </v-item-group>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    data: () => ({
      menu: false,
      color: '#1976D2',
    }),

    computed: {
      ...mapState('Tema', ['colors']),
    },

    watch: {
      color (val) {
        this.$store.dispatch('Tema/setColorTheme', val)
      },
    },
  }
</script>

<style lang="sass">
  .v-settings
    .v-item-group > *
      cursor: pointer

    &__item
      border-style: solid
      border-color: transparent !important

      &--active
        border-color: #00cae3 !important
</style>
