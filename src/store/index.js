import Vue from "vue";
import Vuex from "vuex";
import jwtDecode from "jwt-decode";
import API from "@/api/";
import AgendaStore from "./agenda.js";
import NovoTicketStore from "./novo-ticket";
import FilaEsperaStore from "./fila-espera";
import TemaStore from "./tema";
import AtendimentosOnlineStore from "./atendimentos-online";
import SocketStatusStore from "./socket-status";
import FoneStore from "./fone";
import vue from "@/main";
import atividades from "./atividades.js";
import ErrorModule from "./error.js";

Vue.use(Vuex);

const initState = () => {
  return {
    updateVersion: null,
    barColor: "rgba(0, 0, 0), rgba(0, 0, 0)",
    barImage:
      "https://demos.creative-tim.com/material-dashboard/assets/img/sidebar-1.jpg",
    drawer: null,
    token: localStorage.getItem("access_token") || "unauthorized",
    snack: {
      content: "",
      color: "",
    },
    mutexes: {
      chaves: false,
      userMap: false,
      chaveMap: false,
      ticketMap: false,
      acaoMap: false,
      userList: false,
      allSituacao: false,
      allMeta: false,
      onLogout: false,
    },
    cache: {
      atendimento: null,
      monitor: null,
      chaves: null,
      userList: null,
      userMap: null,
      ticketMap: null,
      ticketUserMap: null,
      acaoMap: null,
      acaoMapByCdticket: null,
      origem: null,
      motivo: null,
      situacao: null,
      urgencia: null,
      tipoAgendamento: null,
      ticket: {
        data: null,
      },
      grupoAcesso: null,
    },
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    tables: {},
    tabControl: {
      cont: -1,
      tabOpens: 0,
      indexId: null,
      items: [],
      tabOpen: {},
      tabMultipleIndex: {},
    },
    solicitantesFromChave: {},
    componentControl: {},
    forcedLogout: false,
    isDashboard: false,
    teste: [
      {
        teste: 0,
      },
    ],
  };
};

export default new Vuex.Store({
  modules: {
    atividades,
    Agenda: AgendaStore,
    NovoTicket: NovoTicketStore,
    FilaEspera: FilaEsperaStore,
    Fone: FoneStore,
    Tema: TemaStore,
    AtendimentosOnline: AtendimentosOnlineStore,
    SocketStatus: SocketStatusStore,
    error: ErrorModule, // CORRIGIDO: mudado de Error para error para corresponder ao namespace usado
  },
  state: initState(),
  mutations: {
    UPDATE_VERSION(state, version) {
      state.updateVersion = version;
    },

    SET_MUTEX_ACTION(state, { action, value }) {
      state.mutexes[action] = value;
    },

    UPDATE_SET(state, payload) {
      state.teste = payload;
    },

    SET_BAR_IMAGE(state, payload) {
      state.barImage = payload;
    },
    SET_DRAWER(state, payload) {
      state.drawer = payload;
    },
    SET_USER(state, payload) {
      state.user = payload;
    },
    SET_GRUPO_ACESSO(state, payload) {
      state.cache.grupoAcesso = payload;
    },
    SHOW_SNACK(state, payload) {
      state.snack = payload;
    },
    LOGOUT(state, forcedLogout) {
      localStorage.removeItem("access_token");
      Object.assign(state, initState());
      state.forcedLogout = forcedLogout;
    },
    SET_FORCEDLOGOUT(state, payload) {
      state.forcedLogout = payload;
    },
    SET_TOKEN(state, payload) {
      state.token = payload;
    },
    SET_ORIGEM(state, payload) {
      // payload = vetor de origens (raw do banco de dados)
      state.cache.origem = payload;
    },
    SET_TIPOAGENDAMENTO(state, payload) {
      state.cache.tipoAgendamento = payload;
    },
    SET_SITUACAO(state, payload) {
      state.cache.situacao = payload;
    },
    SET_URGENCIA(state, payload) {
      state.cache.urgencia = payload;
    },
    SET_MOTIVO(state, payload) {
      state.cache.motivo = payload;
    },
    SET_ATENDIMENTO(state, payload) {
      state.cache.atendimento = payload;
    },
    SET_CHAVES(state, payload) {
      state.cache.chaves = payload;
    },
    SET_CHAVEMAP(state, payload) {
      state.cache.chaveMap = payload;
    },
    SET_MONITOR(state, payload) {
      state.cache.monitor = payload;
    },
    SET_SCREENSIZE(state, payload) {
      state.screen = payload;
    },
    SET_TABLE(state, { nmtable, data }) {
      state.tables[nmtable] = data;
    },
    SET_USERLIST(state, payload) {
      state.cache.userList = payload;
    },
    SET_USERMAP(state, payload) {
      state.cache.userMap = payload;
    },
    SET_TAB(state, payload) {
      state.tabControl.indexId = payload;
    },
    CHANGE_TAB(state, payload) {
      state.tabControl.indexId = payload;
    },
    UPDATE_TAB_PROPS(state, { id, props }) {
      const i = state.tabControl.items.findIndex((item) => item?.id === id);
      if (i !== -1) {
        state.tabControl.items[i].props = props;
      }
    },
    INC_TAB_CONT(state) {
      state.tabControl.cont++;
    },
    NEW_TAB_ITEM(state, payload) {
      state.tabControl.tabOpens++;
      state.tabControl.items.push(payload);
      // state.tabControl.indexId = state.tabControl.items.length - 1
    },
    CLOSE_TAB_ITEM(state, key) {
      const name = key.split("__")[0];
      state.tabControl.tabOpen[name] = null;
      delete state.tabControl.tabOpen[name];
      const index = state.tabControl.items.findIndex(
        (item) => item?.id === key
      );
      if (index >= 0) {
        state.tabControl.tabOpens--;
        delete state.tabControl.items[index];
        delete Vue.options.components[key];

        if (state.tabControl.tabOpens <= 0) {
          state.tabControl.indexId = null;
        }
      }
    },
    SET_TAB_OPEN(state, { name, id }) {
      state.tabControl.tabOpen[name] = id;
    },
    DELETE_TAB_ITEM(state, key) {},
    SET_ISDASHBOARD(state, payload) {
      state.isDashboard = payload;
    },
    SET_TICKET_META(state, payload) {
      state.cache.ticket.meta = payload;
    },
    SET_TICKET(state, { key, value }) {
      state.cache.ticket[key] = value;
    },
    SET_TICKET_MAP(state, payload) {
      state.cache.ticketMap = state.cache.ticketMap || {};
      Object.assign(state.cache.ticketMap, payload);
    },
    SET_TICKETUSER_MAP(state, payload) {
      state.cache.ticketUserMap = state.cache.ticketUserMap || {};
      Object.assign(state.cache.ticketUserMap, payload);
    },
    SET_ACAOMAP_TICKET(state, payload) {
      state.cache.acaoMapByCdticket = state.cache.acaoMapByCdticket || {};
      for (const cdticket in payload) {
        for (const [i, acao] of Object.entries(payload[cdticket])) {
          payload[cdticket][i] = state.cache.acaoMap[acao.cd];
        }
      }
      Object.assign(state.cache.acaoMapByCdticket, payload);
    },
    SET_ACAOMAP(state, payload) {
      state.cache.acaoMap = state.cache.acaoMap || {};
      Object.assign(state.cache.acaoMap, payload);
    },
    ADD_SOLICITANTES_FROM_CHAVE(state, { cdchave, data }) {
      state.solicitantesFromChave[cdchave] = data;
    },
  },

  actions: {
    stopAtendimento({ commit }, payload) {},

    setIsDashboard({ commit, state, dispatch }, payload) {
      if (payload !== state.isDashboard) {
        commit("SET_ISDASHBOARD", payload);
        /*
        if (payload) {
          Vue.prototype.$socketio.connect()
        } else {
          Vue.prototype.$socketio.disconnect()
        }
        */
      }
    },

    openTab({ commit, state }, item) {
      // item = [{ name, component, title, unique? }]
      if (item?.name) {
        // Se aba for única e já tiver uma aba aberta
        const name = item.unique ? item.name : `${item.name}-${item.props.cd}`;
        const id = state.tabControl.tabOpen[name];
        if (id) {
          commit("CHANGE_TAB", id);
          if (item.props) {
            commit("UPDATE_TAB_PROPS", {
              id,
              props: item.props,
            });
          }
        } else {
          commit("INC_TAB_CONT");
          if (item.unique) {
            item.id = `${item.name}__${state.tabControl.cont}`;
          } else {
            item.id = `${item.name}-${item.props.cd}__${state.tabControl.cont}`;
            item.name = `${item.name}-${item.props.cd}`;
          }
          Vue.component(item.id, item.component);
          commit("SET_TAB_OPEN", { name: item.name, id: item.id });
          commit("SET_ISDASHBOARD", true);
          commit("NEW_TAB_ITEM", item);
          commit("CHANGE_TAB", item.id);
          // commit('SET_TAB', state.tabControl.items.length - 1)
        }
      } else {
        commit("SET_ISDASHBOARD", false);
      }
    },

    changeTab({ commit }, key) {
      commit("CHANGE_TAB", key);
    },

    closeTab({ commit, state }, key) {
      commit("CLOSE_TAB_ITEM", key);
    },

    async logout({ commit, state }, forcedLogout) {
      if (!state.mutexes.onLogout) {
        commit("SET_MUTEX_ACTION", { action: "onLogout", value: true });
        await API.Auth.logout();
        commit("LOGOUT", forcedLogout);
        commit("FilaEspera/RESET");
        commit("Agenda/RESET");
        vue.$socketio.onDisconnect("io server disconnect");
        commit("SET_MUTEX_ACTION", { action: "onLogout", value: false });
      }
    },

    screenResize({ commit }, data) {
      commit("SET_SCREENSIZE", data);
    },

    snack(state, { content, color, halign = "right", valign = "top" }) {
      const position = {
        bottom: valign === "bottom",
        top: valign === "top",
        left: halign === "left",
        right: halign === "right",
      };

      state.commit("SHOW_SNACK", { content, color, position });
    },

    async allEvento({ commit }, { dtinicio, dtfim }) {
      return await API.Agenda.allEvento(dtinicio, dtfim);
    },

    async addEvento({ dispatch }, item) {
      await API.Agenda.addEvento(item);
      await dispatch("Agenda/getOwnTodayEvents");
    },

    async duplicarEvento({ dispatch }, data) {
      await API.Agenda.duplicarEvento(data);
      await dispatch("Agenda/getOwnTodayEvents");
    },

    async deleteEvento({ dispatch }, cd) {
      await API.Agenda.deleteEvento(cd);
      await dispatch("Agenda/getOwnTodayEvents");
    },

    async updateEvento({ dispatch }, item) {
      await API.Agenda.updateEvento(item);
      await dispatch("Agenda/getOwnTodayEvents");
    },

    async fixarEvento({ dispatch }, item) {
      await API.Agenda.fixarEvento(item);
    },

    async addAtendimento({ dispatch }, item) {
      const ret = await API.Atendimento.addAtendimento(item);
      if (item.cdfila != null) {
        await dispatch("FilaEspera/removeFromQueue", item.cdfila);
      }
      await dispatch("allAtendimentos", true);
      return ret;
    },

    async addMotivo({ commit }, motivo) {
      await API.Atendimento.addMotivo(motivo);
    },

    async deleteMotivo({ commit }, cd) {
      await API.Atendimento.deleteMotivo(cd);
    },

    async allMotivo({ commit, state }, force = false) {
      let data = state.cache.motivo;
      if (!data || force) {
        data = await API.Atendimento.allMotivo();
        commit("SET_MOTIVO");
      }
      return data;
    },

    async updateMotivo({ state }, data) {
      await API.Atendimento.updateMotivo(data);
    },

    async addOrigem({ commit }, origem) {
      await API.Atendimento.addOrigem(origem);
    },

    async deleteOrigem({ commit }, cd) {
      await API.Atendimento.deleteOrigem(cd);
    },

    async updateOrigem({ commit }, origem) {
      await API.Atendimento.updateOrigem(origem);
    },

    async allOrigem({ commit, state }, force = false) {
      let data = state.cache.origem;
      if (!data || force) {
        data = await API.Atendimento.allOrigem();
        commit("SET_ORIGEM", data);
      }
      return data;
    },

    async allUrgencia({ commit, state }, force = false) {
      let data = state.cache.urgencia;
      if (!data || force) {
        data = await API.Ticket.allUrgencia();
        commit("SET_URGENCIA", data);
      }
      return data;
    },

    async addUrgencia({ commit }, data) {
      await API.Ticket.addUrgencia(data);
    },

    async updateUrgencia({ commit }, data) {
      await API.Ticket.updateUrgencia(data);
    },

    async deleteUrgencia({ commit }, cd) {
      await API.Ticket.deleteUrgencia(cd);
    },

    // Altere esta função em seu index.js:
async allTipoAgendamento({ commit, state, dispatch }, force = false) {
  try {
    let data = state.cache.tipoAgendamento;
    if (!data || force) {
      // Vamos usar diretamente o módulo Agenda que você já tem implementado
      // Você já tem Agenda importado em seu store (verificado pelo erro que mostrou)
      data = await dispatch('Agenda/allTipoAgendamento', null, { root: true });
      
      // Se o dispatch acima falhar, use um fallback
      if (!data) {
        console.warn('Fallback: Usando array vazio para tiposAgendamento');
        data = [];
      }
      
      commit("SET_TIPOAGENDAMENTO", data);
    }
    return data;
  } catch (error) {
    console.error('Erro ao buscar tipos de agendamento:', error);
    // Retorne array vazio em caso de erro para evitar falhas em cascata
    return [];
  }
},

    async addTipoAgendamento({ commit }, data) {
      await API.Agenda.addTipoAgendamento(data);
    },

    async updateTipoAgendamento({ commit }, data) {
      await API.Agenda.updateTipoAgendamento(data);
    },

    async deleteTipoAgendamento({ commit }, cd) {
      await API.Agenda.deleteTipoAgendamento(cd);
    },

    async allSituacao(
      { commit, state },
      args = { force: false, mutex: false }
    ) {
      const { force, mutex } = args;
      let data = state.cache.situacao;

      if (!data || force || (!mutex && !state.mutexes.allSituacao)) {
        if (mutex) {
          commit("SET_MUTEX_ACTION", { action: "allSituacao", value: true });
        }
        data = await API.Ticket.allSituacao();

        if (mutex) {
          commit("SET_MUTEX_ACTION", { action: "allSituacao", value: false });
        }
        commit("SET_SITUACAO", data);
      }
      return data;
    },

    async addSituacao({ commit }, data) {
      await API.Ticket.addSituacao(data);
    },

    async updateSituacao({ commit }, data) {
      await API.Ticket.updateSituacao(data);
    },

    async deleteSituacao({ commit }, cd) {
      await API.Ticket.deleteSituacao(cd);
    },

    async atendimentoStopStart({ commit }, data) {
      return await API.Atendimento.stopStart(data);
    },

    async allAtendimentos({ commit, state }, force = false) {
      let data = state.cache.atendimento?.data;
      if (!data || force) {
        data = await API.Atendimento.all();
        commit("SET_ATENDIMENTO", { data });
      }
      return data;
    },

    async allAtendimentosAdmin({ dispatch }, data) {
      return await API.Atendimento.allAdmin(data);
    },

    async atendimentoChangeMotivo({ dispatch }, data) {
      return await API.Atendimento.changeMotivo(data);
    },

    async getServerTime({ state }) {
      const t0 = new Date().getTime();
      const serverTime = await API.Time.get();
      const t1 = new Date().getTime();
      const delta = t1 - t0;
      return serverTime + delta;
    },

    async getTable({ state, commit }, nmtable, force = false) {
      let data = state.tables[nmtable];
      if (!data || force) {
        data = (await API.User.getTable(nmtable)).jscontent;
        if (!data) {
          return null;
        }
        commit("SET_TABLE", { nmtable, data });
      } else {
        data = state.tables[nmtable];
      }

      return data;
    },

    async setTable({ commit }, { nmtable, data }) {
      commit("SET_TABLE", { nmtable, data: data.jscontent });
      await API.User.setTable({ id: nmtable, data });
    },

    async allChaves(
      { commit, dispatch, state }, // CORRIGIDO: adicionado state ao destructuring para corrigir o acesso
      args = { force: false, mutex: false }
    ) {
      try {
        const { force, mutex } = args;
        if (!state.mutexes.chaves || !mutex) {
          if (mutex) {
            commit("SET_MUTEX_ACTION", { action: "chaves", value: true });
          }
          let data = state.cache.chaves;
          if (!data || force) {
            data = await API.Chave.all();
          }

          commit("SET_CHAVES", data);
          if (mutex) {
            commit("SET_MUTEX_ACTION", { action: "chaves", value: false });
          }
          return data;
        }
        return null;
      } catch (error) {
        // Dispatch para o módulo de erro
        dispatch("error/handleError", { // CORRIGIDO: agora está correto com o nome do módulo 'error'
          message: "Erro ao buscar chaves",
          type: "error",
          details: error,
        });
        throw error; // Re-lança o erro para tratamento no componente
      }
    },

    async doneAtendimento({ dispatch }, item) {
      await API.Atendimento.done(item);
      await dispatch("allAtendimentos", true);
    },

    async destroyAtendimento({ state }, cd) {
      await API.Atendimento.destroy(cd);
    },

    async updateAtendimento({ state }, data) {
      await API.Atendimento.update(data);
    },

    async nomeClientes({ dispatch }) {
      const ret = await dispatch("allChaves");
      return ret.map((item) => {
        return {
          value: item.cd,
          text: item.idfantasia,
        };
      });
    },

    async addSolicitante({ state, commit, dispatch }, solicitante) {
      return await API.Chave.addSolicitante(solicitante);
    },

    async allSolicitantesFromChave(
      { state, commit },
      data = { force: false, cdchave: -1 }
    ) {
      const cdchave = data.cdchave;
      if (data.force || !(cdchave in state.solicitantesFromChave)) {
        const solicitantes = await API.Chave.allSolicitantesFromChave(cdchave);
        commit("ADD_SOLICITANTES_FROM_CHAVE", {
          cdchave: cdchave,
          data: solicitantes,
        });
        return solicitantes;
      }

      return state.solicitantesFromChave[cdchave];
    },

    async monitor({ state, commit }, { date, force }) {
      if (force || !state.cache.monitor) {
        const data = await API.Monitor.get(date);
        commit("SET_MONITOR", data);
        return data;
      }

      return state.cache.monitor;
    },

    async userList({ state, commit }, args = { force: false, mutex: true }) {
      let data = null;
      const { force, mutex } = args;
      if (!state.mutexes.userList || !mutex) {
        if (mutex) {
          commit("SET_MUTEX_ACTION", { action: "userList", value: true });
        }

        if (force || !state.cache.userList) {
          data = await API.User.getList();
        } else {
          data = state.cache.userList;
        }

        if (mutex) {
          commit("SET_MUTEX_ACTION", { action: "userList", value: false });
        }
        commit("SET_USERLIST", data);
        return data;
      }

      return null;
    },

    async userMap(
      { state, dispatch, commit },
      args = { force: false, mutex: true }
    ) {
      const { force, mutex } = args;

      if (!state.mutexes.userMap || !mutex) {
        if (mutex) {
          commit("SET_MUTEX_ACTION", { action: "userMap", value: true });
        }

        let data = null;
        const userMap = {};
        if (force || !state.cache.userList) {
          data = await dispatch("userList", { force: true, mutex: false });
        } else {
          data = state.cache.userList;
        }
        for (const user of data) {
          userMap[user.cd] = user;
        }

        if (mutex) {
          commit("SET_MUTEX_ACTION", { action: "userMap", value: false });
        }
        commit("SET_USERMAP", userMap);
        return userMap;
      }
      return null;
    },

    async addGrupoAcesso({ state }, data) {
      await API.User.addGrupoAcesso(data);
    },

    async allGrupoAcesso({ state, commit }, force = false) {
      let data = null;
      if (force || !state.cache?.grupoAcesso) {
        data = await API.User.allGrupoAcesso();
        commit("SET_GRUPO_ACESSO", data);
      } else {
        data = state.cache.grupoAcesso;
      }

      return data;
    },

    async createUser({ state }, data) {
      return await API.User.create(data);
    },

    async userUpdate({ state }, data) {
      await API.User.update(data);
    },

    async upsertTicket({ state }, data) {
      return await API.Ticket.upsert(data);
    },

    async createAcao({ state, dispatch }, data) {
      return await API.Ticket.addAcao(data);
    },

    async uploadAcaoFiles({ state }, data) {
      await API.Ticket.uploadAcaoFiles(data.files, data.ticketcd, data.acaocd);
    },

    async downloadAcaoFile({ state }, data) {
      return await API.Ticket.downloadAcaoFile(data);
    },

    async allTicketsKanban({ state, commit }, force = false) {
      if (force || !state.cache.ticket.kanban) {
        const data = await API.Ticket.kanban();
        commit("SET_TICKET", { key: "kanban", value: data });
      }

      return state.cache.ticket.kanban;
    },

    async startServicoAcao({ dispatch }, cdacao) {
      await API.Ticket.startServicoAcao(cdacao);
      dispatch("stopAtendimento", true);
    },

    async stopServicoAcao({ state }) {
      await API.Ticket.stopServicoAcao();
    },

    async getAcaoByCd({ state, commit }, { force = false, cd }) {
      if (force || !(cd in state.cache.acaoMap)) {
        const acaoMap = {};
        const acao = await API.Ticket.getAcao(cd);
        acaoMap[cd] = acao;
        commit("SET_ACAOMAP", acaoMap);
      }

      return state.cache.acaoMap[cd];
    },

    async getAcaoByCdticket({ state, commit }, { force = false, cdticket }) {
      if (
        force ||
        !state.cache.acaoMapByCdticket ||
        !(cdticket in state.cache.acaoMapByCdticket)
      ) {
        const acaoMapTicket = {};
        const rawAcoes = await API.Ticket.allAcao(cdticket);
        acaoMapTicket[cdticket] = rawAcoes;

        const acaoMap = {};
        for (const acao of rawAcoes) {
          acaoMap[acao.cd] = acao;
        }
        commit("SET_ACAOMAP", acaoMap);
        commit("SET_ACAOMAP_TICKET", acaoMapTicket);
      }
      return state.cache.acaoMapByCdticket[cdticket];
    },

    async deleteAcao({ state }, cdacao) {
      await API.Ticket.deleteAcao(cdacao);
    },

    async getTicket({ state, commit }, { cd, force = false }) {
      if (!state.cache.ticketMap || !(cd in state.cache.ticketMap) || force) {
        const ticket = {};
        ticket[cd] = await API.Ticket.get(cd);
        commit("SET_TICKET_MAP", ticket);
      }
      return state.cache.ticketMap[cd];
    },

    async ticketUserMap(
      { state, commit },
      { cdticketArray, force = false, mutex = true }
    ) {
      if (!state.mutexes.ticketUserMap || !mutex) {
        commit("SET_MUTEX_ACTION", { action: "ticketUserMap", value: true });

        if (state.cache.ticketUserMap && !force) {
          cdticketArray = cdticketArray.filter(
            (cdticket) => !state.cache.ticketUserMap[cdticket]
          );
        }

        const ticketUserMap = {};
        if (force || !state.cache.ticketUserMap || cdticketArray.length > 0) {
          const data = await API.Ticket.allUsersFromTicket(cdticketArray);
          for (const ticket of data) {
            ticketUserMap[ticket.cd] = ticket.users.map((user) => user.cd);
          }
        }

        commit("SET_MUTEX_ACTION", { action: "ticketUserMap", value: false });
        commit("SET_TICKETUSER_MAP", ticketUserMap);
        return state.cache.ticketUserMap;
      }
      return null;
    },

    async ticketDownloadExcel({ state }, filter) {
      await API.Ticket.downloadExcel(filter);
    },

    async allTicketsFilter({ state, commit }, data) {
      const tickets = await API.Ticket.allFilter(data);
      const ticketMap = {};
      for (const ticket of tickets) {
        ticketMap[ticket.cd] = ticket;
      }
      commit("SET_TICKET_MAP", ticketMap);
      return tickets;
    },

    async allTicketsFilterPaginate({ state, commit }, data) {
      const tickets = await API.Ticket.allFilterPaginate(data);
      const ticketMap = {};
      for (const ticket of tickets[0]) {
        ticketMap[ticket.cd] = ticket;
      }
      commit("SET_TICKET_MAP", ticketMap);
      return tickets;
    },

    async updateKanbanOrder({ state }, data) {
      await API.Ticket.updateKanbanOrder(data);
    },

    async allMeta({ state, commit }, args = { force: false, mutex: false }) {
      let data = null;
      const { force, mutex } = args;
      if (!state.mutexes.allMeta || !mutex) {
        if (mutex) {
          commit("SET_MUTEX_ACTION", { action: "allMeta", value: true });
        }

        if (force || !state.cache.ticket?.meta) {
          data = await API.Ticket.allMeta();
        } else {
          data = state.cache.ticket.meta;
        }

        if (mutex) {
          commit("SET_MUTEX_ACTION", { action: "allMeta", value: false });
        }
        commit("SET_TICKET_META", data);
      }
      return data;
    },

    async motivoMap({ state, commit, dispatch }, force = false) {
      let data = null;
      const motivoMap = {};
      if (force || !state.cache?.ticket?.meta) {
        data = await dispatch("allMeta", { force: true, mutex: false }).motivo;
      } else {
        data = state.cache.ticket.meta.motivo;
      }

      for (const motivo of data) {
        motivoMap[motivo.cd] = motivo;
      }

      return motivoMap;
    },

    async situacaoMap({ state, commit, dispatch }, force = false) {
      let data = null;
      const situacaoMap = {};
      if (force || !state.cache?.ticket?.meta) {
        data = await dispatch("allMeta", { force: true, mutex: false })
          .situacao;
      } else {
        data = state.cache.ticket.meta.situacao;
      }

      for (const situacao of data) {
        situacaoMap[situacao.cd] = situacao;
      }

      return situacaoMap;
    },

    async urgenciaMap({ state, commit, dispatch }, force = false) {
      let data = null;
      const urgenciaMap = {};
      if (force || !state.cache?.ticket?.meta) {
        data = await dispatch("allMeta", { force: true, mutex: false })
          .urgencia;
      } else {
        data = state.cache.ticket.meta.urgencia;
      }

      for (const urgencia of data) {
        urgenciaMap[urgencia.cd] = urgencia;
      }

      return urgenciaMap;
    },

    async addTicketAcao({ dispatch }, data) {
      const ret = await API.Ticket.addTicketAcao(data);
      await dispatch("allAtendimentos", true);
      return ret;
    },

    async changeTicketSituacao({ dispatch }, data) {
      return await API.Ticket.changeSituacao(data);
    },
  },

  getters: {
    userList(state) {
      return state.cache.userList;
    },
    userMap(state) {
      return state.cache.userMap;
    },
    metaMap(state) {
      const transform = (arr) => {
        return arr.reduce((prev, curr) => {
          prev[parseInt(curr.cd)] = curr;
          return prev;
        }, {});
      };
      const { urgencia, motivo, situacao, origem } = state.cache.ticket.meta;
      return {
        urgencia: transform(urgencia),
        motivo: transform(motivo),
        situacao: transform(situacao),
        origem: transform(origem),
      };
    },
    metaList(state) {
      return state.cache.ticket.meta;
    },

    situacaoMap(state) {
      if (!state.cache.situacao) {
        return null;
      }

      const situacaoMap = {};
      for (const situacao of state.cache.situacao) {
        situacaoMap[situacao.cd] = situacao;
      }
      return situacaoMap;
    },
    chaveMap(state) {
      if (!state.cache.chaves) {
        return null;
      }
      const chaveMap = {};
      for (const chave of state.cache.chaves) {
        chaveMap[chave.cd] = chave;
      }
      return chaveMap;
    },
    tipoAgendamentoMap(state) {
      if (!state.cache.tipoAgendamento) {
        return null;
      }
      const tipoAgendamentoMap = {};
      for (const tipoAgendamento of state.cache.tipoAgendamento) {
        tipoAgendamentoMap[tipoAgendamento.cd] = tipoAgendamento;
      }
      return tipoAgendamentoMap;
    },
    checkMobile(state) {
      return state.screen.width <= 1280;
    },

    screen(state) {
      return state.screen;
    },

    token(state) {
      return state.token;
    },

    user(state) {
      if (state.token !== null && state.token !== "unauthorized") {
        const { idlogin, cd, roles, idcolor } = jwtDecode(state.token);
        return { idlogin, cd, roles, idcolor };
      }
      return {
        idlogin: null,
        cd: null,
        roles: null,
        idcolor: null,
      };
    },

    forcedLogout(state) {
      return state.forcedLogout;
    },

    tabItems(state) {
      return state.tabControl.items.map((it) => it.name);
    },

    tabContents(state) {
      return state.tabControl.items.filter((tab) => tab.name);
    },

    tabIndexId(state) {
      return state.tabControl.indexId;
    },

    tabOpens(state) {
      return state.tabControl.tabOpens;
    },

    isDashboard(state) {
      return state.isDashboard;
    },

    tabAtendimentoCont(state) {
      return state.tabControl.tabAtendimentoCont;
    },
  },
});