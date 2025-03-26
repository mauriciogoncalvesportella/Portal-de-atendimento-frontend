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
      // Alterado para usar o namespace em minúsculo
      errorMessage: state => state.error ? state.error.message : null,
      errorType: state => state.error ? (state.error.type || 'error') : 'error'
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
      // Alterado para usar o namespace em minúsculo
      this.$store.dispatch('error/clearError');
    }
  }
};
</script>