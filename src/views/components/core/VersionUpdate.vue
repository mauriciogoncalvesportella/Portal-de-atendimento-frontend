<template>
  <v-row
    align="center"
  >
    <v-col
      cols="12"
    >
      <div
        class="d-flex justify-center align-center"
      >
        <div
          class="d-flex flex-column"
          style="max-width: 300px"
        >
          <div
            class="d-flex"
          >
            <v-icon
              left
              color="primary"
              size="75"
            >
              mdi-update
            </v-icon>
            <span
              class="text-h4 primary--text font-weight-light"
              style="text-align: justify"
            >
              Você está usando uma versão antiga da Central. A nova versão "{{ $store.state.updateVersion }}" está disponível!
            </span>
          </div>
          <v-btn
            block
            tile
            color="primary"
            class="mx-auto mt-3"
            @click="updateVersion"
          >
            Atualizar ({{ counter }})
          </v-btn>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script>
  export default {
    data: () => ({
      counter: 20,
    }),

    mounted () {
      setInterval(() => {
        if (this.counter) {
          this.counter -= 1
        } else {
          this.updateVersion()
        }
      }, 1000)
    },

    methods: {
      updateVersion () {
        setTimeout(() => {
          this.$nextTick(() =>
            caches
              .keys()
              .then((keyList) => {
                return Promise.all(keyList.map((key) => caches.delete(key)))
                  .finally(window.location.reload())
              }),
          )
        }, 250)
      },
    },
  }
</script>
