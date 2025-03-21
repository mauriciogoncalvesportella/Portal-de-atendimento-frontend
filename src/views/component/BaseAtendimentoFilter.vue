<template>
  <v-card>
    <v-card-title> Filtros </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <cliente-selector v-model="clientes" />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <user-selector v-model="users" />
        </v-col>
      </v-row>
      <full-date-picker ref="datePicker" v-model="times" />
    </v-card-text>
    <v-divider />

    <v-card-actions>
      <v-btn text color="primary" @click="send"> Pesquisar </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "BaseAtendimentoFilter",
  components: {
    ClienteSelector: () => import("./BaseClientesSelector.vue"),
    FullDatePicker: () => import("./BaseFullDatePicker.vue"),
    UserSelector: () => import("./BaseUserSelector.vue"),
  },

  props: {
    value: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      clientes: [],
      users: [],
      times: null,
    };
  },

  computed: {
    computedDateFormatted() {
      return this.formatDate(this.dtinicio);
    },
  },

  methods: {
    send() {
      this.loading = true;
      const projection = {};
      if (this.users.length) {
        projection.users = this.users;
      }
      if (this.clientes.length) {
        projection.clientes = this.clientes;
      }
      if (this.times?.dtinicio) {
        projection.dtinicio = this.times.dtinicio;
      }
      if (this.times?.dtfim) {
        projection.dtfim = this.times.dtfim;
      }

      this.$emit("input", projection);
      this.$emit("send");
    },
  },
};
</script>
