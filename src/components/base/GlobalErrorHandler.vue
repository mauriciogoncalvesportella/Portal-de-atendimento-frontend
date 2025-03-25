<template>
  <v-snackbar
    v-model="showError"
    :color="errorType"
    :timeout="5000"
    top
    right
  >
    {{ errorMessage }}
    <template v-slot:action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        @click="closeError"
      >
        Fechar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'GlobalErrorHandler',
  data() {
    return {
      showError: false,
    };
  },
  computed: {
    ...mapState({
      errorMessage: state => state.Error.message,
      errorType: state => state.Error.type || 'error'
    })
  },
  watch: {
    errorMessage(newVal) {
      if (newVal) {
        this.showError = true;
      }
    }
  },
  methods: {
    closeError() {
      this.showError = false;
      this.$store.dispatch('Error/clearError');
    }
  }
};
</script>