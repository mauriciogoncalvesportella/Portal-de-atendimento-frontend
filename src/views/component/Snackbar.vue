<template>
  <div>
    <v-snackbars
      bottom
      right
      :objects.sync="messages"
      style="z-index: 1000"
    >
      <template
        #action="{ close }"
      >
        <v-btn
          icon
          text
          @click="close()"
        >
          <v-icon>
            mdi-close-box-outline
          </v-icon>
        </v-btn>
      </template>
    </v-snackbars>
    <!--v-snackbar
      v-model="show"
      :color="color"
      :bottom="position.bottom"
      :top="position.top"
      :right="position.right"
      :left="position.left"
      :multi-line="true"
    >
      <div class="d-flex justify-space-between align-center">
        {{ message }}
        <v-btn
          text
          @click="show = false"
        >
          x
        </v-btn>
      </div>
    </v-snackbar-->
  </div>
</template>

<script>
  export default {
    components: {
      VSnackbars: () => import('v-snackbars'),
    },

    data: () => ({
      messages: [],
      position: {
        bottom: false,
        top: false,
        right: false,
        left: false,
      },
      show: false,
      message: '',
      color: '',
    }),

    created () {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'SHOW_SNACK') {
          this.message = state.snack.content
          this.color = state.snack.color
          this.position = state.snack.position
          this.show = true
          this.messages.push({
            color: state.snack.color,
            message: state.snack.content,
          })
        }
      })
    },
  }
</script>
