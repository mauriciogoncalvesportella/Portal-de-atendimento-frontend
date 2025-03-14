<template>
  <v-main style="height: 100%">
    <v-img :src="images.sample" class="bg" />
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-hover v-slot="{ hover }">
            <v-form id="login-form" @submit.prevent="login">
              <v-card :elevation="hover ? 5 : 2" class="mb-10">
                <v-toolbar color="primary" dark flat>
                  <v-toolbar-title
                    >Central de Atendimento Data Company</v-toolbar-title
                  >
                </v-toolbar>
                <v-card-text>
                  <v-form>
                    <v-text-field
                      v-model="models.username"
                      label="Usuário"
                      name="login"
                      form="login-form"
                      prepend-icon="mdi-account"
                      type="text"
                      :error-messages="
                        models.username == '' && loginErro != ''
                          ? loginErro
                          : ''
                      "
                    />
                    <v-text-field
                      id="password"
                      v-model="models.password"
                      label="Senha"
                      name="password"
                      form="login-form"
                      prepend-icon="mdi-lock"
                      type="password"
                      :error="models.username == '' && loginErro != ''"
                    />
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    type="submit"
                    color="primary"
                    form="login-form"
                    :loading="loading"
                  >
                    Entrar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
<script>
import API from "@/api/";
export default {
  data() {
    return {
      loginErro: "",
      images: {
        sample: require("@/assets/call.jpeg"),
      },
      valid: true,
      loading: false,
      models: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    // Função auxiliar para decodificar JWT
    decodeJWT(token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error("Erro ao decodificar token:", e);
        return null;
      }
    },

    async login() {
      try {
        this.loading = true;
        await API.Auth.login(this.models.username.trim(), this.models.password);
        this.$store.commit("SET_FORCEDLOGOUT", false);

        // Debug: verificar tokens armazenados
        const accessToken = localStorage.getItem("access_token");
        const token = localStorage.getItem("token");

        console.log(
          "[Auth] Token armazenado como 'access_token':",
          !!accessToken
        );
        console.log("[Auth] Token armazenado como 'token':", !!token);

        // Decodificar e mostrar conteúdo do token para debug
        if (accessToken) {
          const decoded = this.decodeJWT(accessToken);
          console.log("[Auth] Token decodificado:", decoded);
          console.log("[Auth] O token contém 'idlogin'?", !!decoded?.idlogin);
        }

        // Sincronizar tokens se necessário
        if (accessToken && !token) {
          console.log("[Auth] Sincronizando 'token' de 'access_token'");
          localStorage.setItem("token", accessToken);
        }

        // Inicializar conexão de socket
        console.log("[Auth] Inicializando conexão de socket após login");
        if (this.$initSocketConnection) {
          this.$initSocketConnection();
        } else {
          console.warn("[Auth] Método $initSocketConnection não encontrado");
        }

        await this.$router.push({ name: "menu" });
      } catch (err) {
        const msg = err.message;
        this.loginErro = msg;
        this.models.username = "";
        this.models.password = "";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style>
.bg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-size: cover;
  background-color: white;
  opacity: 0.45;
  transform: scale(1);
  -webkit-filter: blur(2px);
}
</style>
