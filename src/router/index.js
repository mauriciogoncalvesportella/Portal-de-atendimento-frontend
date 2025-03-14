import Vue from "vue";
import Router from "vue-router";
import Middleware from "./middleware";
import store from "@/store/index.js";
// import Atendimento from '@/views/pages/Atendimento.vue'
import Monitor from "@/views/pages/Monitor.vue";
import ChartDiario from "@/views/pages/ChartDiario.vue";
import ChartTimeLineHistorico from "@/views/pages/ChartTimeLineHistorico.vue";
import AdminAtendimento from "@/views/pages/AdminAtendimento.vue";
import AdminUsuarios from "@/views/pages/AdminUsuarios";
import AdminGrupos from "@/views/pages/AdminGrupos";
import TicketsOnline from "@/views/pages/TicketsOnline";
import Tickets from "@/views/pages/Tickets";
import TheTicket from "@/views/pages/TheTicket";
import Cadastro from "@/views/pages/Cadastro";
import Agenda from "@/views/pages/Agenda";
import Menu from "@/views/pages/Menu.vue";
import Clientes from "@/views/pages/Clientes.vue";
import FilaEspera from "@/views/pages/FilaEspera.vue";
// import V404 from '@/views/pages/404.vue'

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      props: true,
      component: () => import("@/views/Index"),
      children: [
        {
          path: "",
          props: true,
          beforeEnter: function (to, from, next) {
            return next({
              name: "menu",
            });
          },
        },
        {
          name: "login",
          path: "/login",
          props: true,
          component: () => import("../views/pages/Login"),
          meta: {
            isLogin: true,
          },
        },
      ],
    },
    {
      path: "/dashboard/",
      props: true,
      component: () => import("@/views/Index"),
      beforeEnter: Middleware.autenticacao,
      children: [
        {
          name: "dashboard",
          path: "",
          props: true,
          beforeEnter: function (to, from, next) {
            return next({
              name: "menu",
            });
          },
        },
        {
          name: "atendimento",
          path: "atendimento",
          props: true,
          component: () => import("../views/pages/TicketsOnline"),
          meta: {
            page: "@/views/pages/TicketsOnline.vue",
            component: TicketsOnline,
            unique: true,
            label: "Atendimento",
          },
        },
        {
          name: "menu",
          path: "menu",
          props: true,
          component: () => import("../views/pages/Menu.vue"),
          meta: {
            page: "@/views/pages/Menu.vue",
            component: Menu,
            unique: true,
            label: "Menu",
          },
        },
        {
          path: "tickets",
          props: true,
          beforeEnter: function (to, from, next) {
            return next({
              path: "dashboard/tickets/kanban",
            });
          },
        },
        {
          name: "tickets",
          path: "tickets/:id",
          props: true,
          component: () => import("../views/pages/Tickets"),
          meta: {
            page: "@/views/pages/Tickets.vue",
            component: Tickets,
            unique: true,
            label: "Tickets",
          },
        },
        {
          name: "the-ticket",
          path: "tickets/edit/:cd",
          props: true,
          component: () => import("../views/pages/TheTicket"),
          meta: {
            page: "@/views/pages/TheTicket",
            component: TheTicket,
            unique: false,
            label: "Ticket",
          },
        },
        {
          path: "fila-espera",
          props: true,
          beforeEnter: function (to, from, next) {
            return next({
              path: "dashboard/tickets/fila-espera",
            });
          },
        },
        {
          name: "fila-espera",
          path: "fila-espera/:id",
          props: true,
          component: FilaEspera,
          meta: {
            page: "@/views/pages/fila-espera",
            component: FilaEspera,
            unique: true,
            label: "Fila Espera",
          },
        },
        {
          path: "clientes",
          props: true,
          beforeEnter: function (to, from, next) {
            return next({
              path: "dashboard/clientes/chaves",
            });
          },
        },
        {
          name: "clientes",
          path: "clientes/:id",
          props: true,
          component: Clientes,
          meta: {
            page: "@/views/pages/Clientes.vue",
            component: Clientes,
            unique: true,
            label: "Clientes",
          },
        },
        {
          name: "monitor",
          path: "monitor",
          props: true,
          component: () => import("../views/pages/Monitor"),
          meta: {
            page: "@/views/pages/Monitor.vue",
            component: Monitor,
            unique: true,
            label: "Monitor",
          },
        },
        {
          name: "cadastro",
          path: "cadastro/:table",
          props: true,
          component: () => import("../views/pages/Cadastro.vue"),
          meta: {
            page: "@/views/pages/Cadastro.vue",
            component: Cadastro,
            unique: true,
            label: "Cadastro",
          },
        },
        {
          name: "chart-diario",
          path: "chart/diario",
          props: true,
          component: () => import("../views/pages/ChartDiario.vue"),
          meta: {
            page: "@/views/pages/ChartDiario.vue",
            component: ChartDiario,
            label: "Indicador Diário",
            unique: true,
          },
        },
        {
          name: "chart-historico",
          path: "chart/historico",
          props: (route) => ({ ...route.params }),
          component: () => import("../views/pages/ChartTimeLineHistorico.vue"),
          meta: {
            page: "@/views/pages/ChartTimeLineHistorico.vue",
            component: ChartTimeLineHistorico,
            label: "Indicador Histórico",
            unique: true,
          },
        },
        {
          name: "agenda",
          path: "agenda",
          props: true,
          component: Agenda,
          meta: {
            page: "@/views/pages/Agenda.vue",
            component: Agenda,
            label: "Agenda",
            unique: true,
          },
        },
        {
          name: "admin-atendimento",
          path: "admin/atendimento",
          props: true,
          component: () => import("../views/pages/AdminAtendimento"),
          meta: {
            page: "@/views/pages/AdminAtendimento.vue",
            component: AdminAtendimento,
            label: "Admin Atendimento",
            unique: true,
          },
        },
        {
          name: "admin-usuarios",
          path: "admin/usuarios",
          props: true,
          component: () => import("../views/pages/AdminUsuarios"),
          meta: {
            page: "@/views/pages/AdminUsuarios.vue",
            component: AdminUsuarios,
            unique: true,
            label: "Admin Pessoas",
          },
        },
        {
          name: "admin-grupos",
          path: "admin/grupos",
          props: true,
          component: () => import("../views/pages/AdminGrupos"),
          meta: {
            page: "@/views/pages/AdminGrupos.vue",
            component: AdminGrupos,
            unique: true,
            label: "Admin Grupos",
          },
        },
      ],
    },
    {
      path: "*",
      component: () => import("../views/pages/404"),
    },
  ],
});

router.beforeEach((to, _, next) => {
  if (to.name !== "menu") {
    const isDashboard = !to.meta?.isLogin;
    store.dispatch("setIsDashboard", !to.meta?.isLogin);
    const tabItem = {
      name: to.params?.name || to.name,
      routerName: to.name,
      component: to.meta?.component || null,
      unique: to.meta?.unique,
      label: to.params?.label || to.meta?.label || to.name,
      path: to.path,
      props: to.params,
    };

    if (isDashboard) {
      store.dispatch("openTab", tabItem);
    }
  }
  next();
});

export default router;
