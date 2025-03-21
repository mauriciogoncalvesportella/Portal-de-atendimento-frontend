<template>
  <v-row justify="center">
    <v-col cols="12" lg="8" xl="6">
      <v-row dense>
        <v-col cols="12">
          <span
            class="text-uppercase text-h3 font-weight-light text--secondary"
          >
            Cadastros
          </span>
        </v-col>
        <v-col cols="12">
          <v-row justify="start">
            <v-col cols="12" lg="3">
              <v-list-item-group mandatory color="primary">
                <v-list-item
                  v-for="(currTab, i) in tabs"
                  :key="`tab-${i}`"
                  :to="currTab.to"
                >
                  <v-list-item-icon>
                    <v-icon :color="tabSelected === i ? 'primary' : ''">
                      {{ currTab.icon }}
                    </v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    {{ currTab.title }}
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-col>
            <v-col cols="12" lg="9" class="pt-0">
              <v-sheet height="100%" class="ma-lg-3" color="rgba(0, 0, 0, 0)">
                <template v-if="component">
                  <component :is="component" />
                </template>
              </v-sheet>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import CadastroOrigem from "@/views/component/BaseCadastroOrigem";
import CadastroMotivo from "@/views/component/BaseCadastroMotivo";
import CadastroSituacao from "@/views/component/BaseCadastroSituacao";
import CadastroUrgencia from "@/views/component/BaseCadastroUrgencia";
import CadastroTipoAgendamento from "@/views/component/BaseCadastroTipoAgendamento";
import CadastroEditor from "@/views/component/BaseCadastroEditor";

export default {
  name: "Cadastro",
  props: {
    props: {
      type: Object,
      default: () => {
        return {
          table: "origem",
          openNew: false,
        };
      },
    },
  },
  data() {
    return {
      tabs: [
        {
          id: "origem",
          title: "Origem",
          icon: "mdi-table",
          to: "/dashboard/cadastro/origem",
          component: CadastroOrigem,
        },
        {
          id: "motivo",
          title: "Motivo",
          icon: "mdi-table",
          to: "/dashboard/cadastro/motivo",
          component: CadastroMotivo,
        },
        {
          id: "situacao",
          title: "Situação",
          icon: "mdi-table",
          to: "/dashboard/cadastro/situacao",
          component: CadastroSituacao,
        },
        {
          id: "urgencia",
          title: "Urgência",
          icon: "mdi-table",
          to: "/dashboard/cadastro/urgencia",
          component: CadastroUrgencia,
        },
        {
          id: "tipo-agendamento",
          title: "Tipo Agendamento",
          icon: "mdi-table",
          to: "/dashboard/cadastro/tipo-agendamento",
          component: CadastroTipoAgendamento,
        },
        // Nova aba de Editor
        {
          id: "editor",
          title: "Atividades",
          icon: "mdi-file-document-edit",
          to: "/dashboard/cadastro/editor",
          component: CadastroEditor,
        },
      ],
    };
  },
  computed: {
    tabSelected() {
      return this.tabs.findIndex((tab) => tab.id === this.props?.table);
    },
    component() {
      const tab = this.tabs.find((tab) => tab.id === this.props?.table);
      return tab?.component;
    },
  },
};
</script>
