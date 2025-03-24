<template>
  <v-snackbar v-model="showError" :color="errorType" top right>
    {{ errorMessage }}
    <template v-slot:action="{ attrs }">
      <v-btn text v-bind="attrs" @click="clearError"> Fechar </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: "GlobalErrorHandler",
  computed: {
    showError: {
      get() {
        return this.$store.getters["error/hasError"];
      },
      set(value) {
        if (!value) {
          this.clearError();
        }
      },
    },
    errorMessage() {
      return this.$store.state.error.message;
    },
    errorType() {
      return this.$store.state.error.type || "error";
    },
  },
  methods: {
    clearError() {
      this.$store.dispatch("error/clearError");
    },
  },
};
</script>
