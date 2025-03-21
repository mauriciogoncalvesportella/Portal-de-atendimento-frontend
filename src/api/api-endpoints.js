// Crie a pasta config se não existir:

// src/config/api-endpoints.js
export const API_BASE_URL =
  process.env.VUE_APP_BACKEND_URL || "http://localhost:3000";

// Formatação padronizada para todos os endpoints
export const API_ENDPOINTS = {
  // Módulo de Atividades
  ATIVIDADES: {
    BASE: `${API_BASE_URL}/api/atividades`,
    BY_ID: (id) => `${API_BASE_URL}/api/atividades/${id}`,
  },

  // Módulo de Agenda
  AGENDA: {
    TIPO: `${API_BASE_URL}/api/agenda/tipo-agendamento/all`,
    EVENTOS: (dataInicio, dataFim) =>
      `${API_BASE_URL}/api/agenda/evento/all/${dataInicio}/${dataFim}`,
  },

  // Módulo de Fila de Espera
  FILA_ESPERA: {
    ONLINE: `${API_BASE_URL}/api/fila-espera/get/online`,
    ALL: `${API_BASE_URL}/api/fila-espera/all`,
  },

  // Módulo de Atendimento
  ATENDIMENTO: {
    ONLINE: `${API_BASE_URL}/api/atendimento/online`,
    ALL_ONLINE: `${API_BASE_URL}/api/atendimento/all-online`,
  },

  // Outros módulos
  USUARIOS: {
    ALL: `${API_BASE_URL}/api/user/all`,
  },

  CHAVES: {
    ALL: `${API_BASE_URL}/api/chave/all`,
  },

  TICKETS: {
    ALL_META: `${API_BASE_URL}/api/ticket/all-meta`,
  },
};
