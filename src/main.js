// =========================================================
// * Vuetify Material Dashboard - v2.1.0
// =========================================================
import Vue from "vue";
import App from "./App.vue";
import router from "./router/";
import store from "./store/index.js";

// Importar setupLogger
import { setupLogger } from "./utils/logger";

// Configurar logger antes de outros plugins
setupLogger({
  level: process.env.NODE_ENV === "production" ? 2 : 0, // WARN em produção, DEBUG em dev
  disableInProduction: false, // Manter logs mesmo em produção, mas em nível WARN
});

// Importações existentes
import "./plugins/base";
import "./plugins/chartist";
import "./plugins/vee-validate";
import Global from "./plugins/global";
import Notifier from "./plugins/notifier";
import Moment from "./plugins/moment";
import StringUtils from "./plugins/string-utils";
import SocketioIOPlugin from "./plugins/socketio"; // Mantenha o plugin existente
import Rules from "./plugins/rules";
import Roles from "./plugins/roles";
import Pouch from "./plugins/pouch";
import vuetify from "./plugins/vuetify";
import { VclFacebook, VclTable } from "vue-content-loading";
import VueTabsChrome from "vue-tabs-chrome";
import Utils from "./plugins/utils";
import VueGoogleCharts from "vue-google-charts";
import CKEditor from "@ckeditor/ckeditor5-vue";
import VueColumnsResizableVuetify from "vue-columns-resizable-vuetify";
import VueApexCharts from "vue-apexcharts";
import VuetifyConfirm from "vuetify-confirm";
import vuePositionSticky from "vue-position-sticky";
import VueObserveVisibility from "vue-observe-visibility";
import InfiniteLoading from "vue-infinite-loading";
import { RecycleScroller } from "vue-virtual-scroller";
import PerfectScrollbar from "vue2-perfect-scrollbar";
import VueNativeNotification from "vue-native-notification";
import "vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css";
import BluePrintInput from "@/views/component/BluePrintInput.vue";

var VueScrollTo = require("vue-scrollto");

// Sincroniza tokens para compatibilidade
if (localStorage.getItem("access_token") && !localStorage.getItem("token")) {
  console.log("[App] Sincronizando tokens para compatibilidade");
  localStorage.setItem("token", localStorage.getItem("access_token"));
} else if (localStorage.getItem("token") && !localStorage.getItem("access_token")) {
  console.log("[App] Sincronizando tokens para compatibilidade (inverso)");
  localStorage.setItem("access_token", localStorage.getItem("token"));
}

// Função helper para obter token
const getAccessToken = () => {
  return localStorage.getItem("access_token") || localStorage.getItem("token") || null;
};

// Configurações do socket - atualize seu plugin existente
import io from "socket.io-client";

// Substitua o plugin de socket existente
Vue.prototype.$socket = {
  instance: null,

  connect() {
    // Recupera o token de autenticação
    const token = getAccessToken();
    
    // Log para depuração
    console.log("[Socket] Configurando conexão com token:", !!token);

    // Configuração do socket
    this.instance = io(
      process.env.VUE_APP_BACKEND_URL || "http://localhost:3000",
      {
        path: "/api/socketio",
        transports: ["websocket", "polling"],

        // Configurações de autenticação
        auth: (cb) => {
          console.log("[Socket] Enviando token de autenticação:", !!token);
          cb({
            token: token,
            // Opcional: passar informações adicionais
            idlogin: localStorage.getItem("username"),
          });
        },

        // Cabeçalhos extras
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Listeners de conexão com logs detalhados
    this.instance.on("connect", () => {
      console.log("[Socket] Conexão estabelecida com sucesso");
    });

    this.instance.on("connect_error", (error) => {
      console.error("[Socket] Erro de conexão:", error);
      console.error(
        "Detalhes completos do erro:",
        JSON.stringify(error, null, 2)
      );
    });

    this.instance.on("disconnect", (reason) => {
      console.log(`[Socket] Desconectado. Motivo: ${reason}`);
    });

    return this.instance;
  },

  disconnect() {
    if (this.instance) {
      this.instance.disconnect();
    }
  },

  reconnect() {
    this.disconnect();
    return this.connect();
  },
};

// Configurar manualmente a instância do socket para o plugin SocketioIOPlugin
Vue.prototype.$socketio = Vue.prototype.$socket;

// Configurações do Vue
Vue.config.productionTip = false;

// Plugins diversos
Vue.use(VueNativeNotification, {
  requestOnNotify: true,
});
Vue.use(PerfectScrollbar);
Vue.use(InfiniteLoading);
Vue.use(VueObserveVisibility);
Vue.use(vuePositionSticky);
Vue.use(VueColumnsResizableVuetify);
Vue.use(VuetifyConfirm, { vuetify });
Vue.use(CKEditor);
Vue.use(RecycleScroller);
Vue.use(Global);
Vue.use(Notifier);
Vue.use(StringUtils);

// Outros plugins
Vue.use(SocketioIOPlugin);
Vue.use(Rules);
Vue.use(Roles);
Vue.use(Moment);
Vue.use(Utils);
Vue.use(Pouch);
Vue.use(VueTabsChrome);
Vue.use(VueGoogleCharts);
Vue.use(VueScrollTo, {
  container: "body",
  duration: 500,
  easing: "ease",
  offset: -100,
  force: true,
  cancelable: true,
  onStart: false,
  onDone: false,
  onCancel: false,
  x: false,
  y: true,
});

// Adicionar manipulador de cache com tratamento de erros
Vue.prototype.$cache = {
  get(key) {
    try {
      return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
    } catch (error) {
      console.error('Sem cache para:', key);
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

// Registros de componentes
Vue.component("BluePrintInput", BluePrintInput);
Vue.component("VueApexCharts", VueApexCharts);
Vue.component("VFacebookLoading", VclFacebook);
Vue.component("VLoadingTable", VclTable);

// Instância principal do Vue
export default new Vue({
  created() {
    // Debug para verificar tokens
    const accessToken = getAccessToken();
    console.log("Access token:", accessToken ? "presente" : "null");
    console.log("Socket token:", accessToken ? "presente" : "null");
    
    // Iniciar socket se houver token
    if (accessToken) {
      this.$socket.connect();
    }
  },
  mounted() {
    window.addEventListener("resize", () => {
      store.dispatch("screenResize", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  },
  router,
  store,
  Notifier,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");