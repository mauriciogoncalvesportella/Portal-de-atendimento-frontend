<template>
  <v-container
    id="chart-diario"
    class="mb-10"
    fluid
  >
    <v-row>
      <v-col
        cols="12"
      >
        <rendimento />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'ChartDiario',
    components: {
      Rendimento: () => import('../component/BaseRendimentoDiario.vue'),
    },

    data () {
      return {
        filter: null,
      }
    },
  }
</script>
