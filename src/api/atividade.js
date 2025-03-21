import { Client as client } from "./rest-client";
import axios from "axios";
import { CacheManager } from "@/utils/cache-manager";
import { Logger } from "@/utils/logger";

// Obter o protocolo e a URL do backend do arquivo .env
const protocol = process.env.VUE_APP_API_PROTOCOL || "https";
const backendHost = (process.env.VUE_APP_BACKEND_URL || "localhost:3000")
  .replace("http://", "")
  .replace("https://", "");
const BACKEND_URL = `${protocol}://${backendHost}`;

// Definir os endpoints para a API de atividades
const API_ENDPOINTS = {
  BASE: `${BACKEND_URL}/api/atividades`,
  BY_ID: (id) => `${BACKEND_URL}/api/atividades/${id}`,
};

// Backup local para quando o backend falhar
let atividadesLocais = [];
let proximoId = 1;

// Chave para armazenamento no localStorage (usado como fallback)
const STORAGE_KEY = "atividades_locais";

// Carregar atividades do localStorage para fallback - agora usando CacheManager
try {
  const cachedData = CacheManager.getFromCache("atividades", 86400000); // 24 horas
  if (cachedData) {
    atividadesLocais = cachedData;
    Logger.info(
      "Atividades",
      `Carregados ${atividadesLocais.length} registros do cache`
    );

    // Encontrar o maior ID para continuar a contagem
    if (atividadesLocais.length > 0) {
      const maxId = Math.max(...atividadesLocais.map((item) => item.id || 0));
      proximoId = maxId + 1;
      Logger.debug("Atividades", `Próximo ID será: ${proximoId}`);
    }
  } else {
    // Compatibilidade com dados antigos - manter temporariamente
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      atividadesLocais = JSON.parse(storedData);
      Logger.info(
        "Atividades",
        `Carregados ${atividadesLocais.length} registros de fallback do localStorage`
      );

      // Migrar para o novo formato
      CacheManager.saveToCache("atividades", atividadesLocais);

      // Encontrar o maior ID
      if (atividadesLocais.length > 0) {
        const maxId = Math.max(...atividadesLocais.map((item) => item.id || 0));
        proximoId = maxId + 1;
      }
    }
  }
} catch (error) {
  Logger.error("Atividades", "Erro ao carregar dados do cache:", error);
  atividadesLocais = [];
}

// Função para salvar no localStorage como fallback - usando CacheManager
const salvarNoStorage = () => {
  try {
    CacheManager.saveToCache("atividades", atividadesLocais);

    // Manter compatibilidade com código antigo - temporariamente
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atividadesLocais));
  } catch (error) {
    Logger.error("Atividades", "Erro ao salvar no cache:", error);
  }
};

// Função auxiliar para obter token de autenticação
const getAuthToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("access_token");
};

// Configurar axios com headers de autenticação padrão
const api = axios.create({
  baseURL: BACKEND_URL,
});

// Adicionar interceptor para incluir token de autenticação
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Verificar se já existe um item com o mesmo título para evitar duplicatas
const tituloJaExiste = (titulo, idExcluir = null) => {
  if (!titulo) return false; // Não validar títulos vazios

  const tituloLowerCase = titulo.toLowerCase().trim();
  return atividadesLocais.some((item) => {
    if (!item.titulo) return false;
    if (idExcluir && item.id === idExcluir) return false; // Ignorar o próprio item
    return item.titulo.toLowerCase().trim() === tituloLowerCase;
  });
};

export default {
  async all() {
    Logger.info("Atividades", "Buscando lista de atividades");
    try {
      // Tenta obter dados do backend real
      const response = await api.get("/api/atividades");
      Logger.info(
        "Atividades",
        `${response.data.length} atividades carregadas do backend`
      );

      // Atualizar dados locais e cache
      atividadesLocais = response.data;
      salvarNoStorage();

      return response.data;
    } catch (error) {
      Logger.warn(
        "Atividades",
        "Erro ao buscar atividades do backend, usando dados locais:",
        error
      );

      // Em caso de falha, usa dados do localStorage
      return atividadesLocais;
    }
  },

  async get(id) {
    Logger.info("Atividades", `Buscando atividade ID: ${id}`);
    try {
      // Tenta obter do backend real
      const response = await api.get(`/api/atividades/${id}`);
      Logger.debug(
        "Atividades",
        "Atividade encontrada no backend",
        response.data
      );
      return response.data;
    } catch (error) {
      Logger.warn(
        "Atividades",
        `Erro ao buscar atividade ${id} do backend, buscando localmente:`,
        error
      );

      // Fallback: busca por ID nos dados locais
      const atividade = atividadesLocais.find((item) => item.id === id) || null;
      if (atividade) {
        Logger.debug(
          "Atividades",
          "Atividade encontrada localmente",
          atividade
        );
      } else {
        Logger.warn(
          "Atividades",
          `Atividade ID ${id} não encontrada no cache local`
        );
      }
      return atividade;
    }
  },

  async add(atividade) {
    Logger.info("Atividades", "Adicionando nova atividade", {
      titulo: atividade.titulo,
    });

    // Verificar duplicatas
    if (tituloJaExiste(atividade.titulo)) {
      Logger.warn(
        "Atividades",
        `Tentativa de adicionar título duplicado: "${atividade.titulo}"`
      );
      throw new Error(
        `Já existe uma atividade com o título "${atividade.titulo}"`
      );
    }

    try {
      // Tenta adicionar no backend real
      const response = await api.post("/api/atividades", atividade);
      Logger.info("Atividades", "Atividade criada no backend com sucesso", {
        id: response.data.id,
      });

      // Atualiza o cache local também
      atividadesLocais.push(response.data);
      salvarNoStorage();

      return response.data;
    } catch (error) {
      Logger.warn(
        "Atividades",
        "Erro ao criar atividade no backend, salvando localmente:",
        error
      );

      // Fallback: adiciona localmente
      const novaAtividade = {
        ...atividade,
        id: proximoId++,
        dataCriacao: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      };

      atividadesLocais.push(novaAtividade);
      salvarNoStorage();

      Logger.info("Atividades", "Atividade salva localmente", {
        id: novaAtividade.id,
      });
      return novaAtividade;
    }
  },

  async update(atividade) {
    Logger.info("Atividades", `Atualizando atividade ID: ${atividade.id}`, {
      titulo: atividade.titulo,
    });

    if (!atividade.id) {
      Logger.error("Atividades", "Tentativa de atualizar sem ID");
      throw new Error("Não é possível atualizar uma atividade sem ID");
    }

    // Verificar duplicatas (exceto o próprio item)
    if (tituloJaExiste(atividade.titulo, atividade.id)) {
      Logger.warn(
        "Atividades",
        `Tentativa de atualizar para título duplicado: "${atividade.titulo}"`
      );
      throw new Error(
        `Já existe outra atividade com o título "${atividade.titulo}"`
      );
    }

    try {
      // Tenta atualizar no backend real
      const response = await api.put(
        `/api/atividades/${atividade.id}`,
        atividade
      );
      Logger.info("Atividades", "Atividade atualizada no backend com sucesso", {
        id: atividade.id,
      });

      // Atualiza o cache local também
      const index = atividadesLocais.findIndex(
        (item) => item.id === atividade.id
      );
      if (index !== -1) {
        atividadesLocais[index] = response.data;
        salvarNoStorage();
      }

      return response.data;
    } catch (error) {
      Logger.warn(
        "Atividades",
        `Erro ao atualizar atividade ${atividade.id} no backend, atualizando localmente:`,
        error
      );

      // Fallback: atualiza localmente
      const index = atividadesLocais.findIndex(
        (item) => item.id === atividade.id
      );
      if (index !== -1) {
        // Manter a data de criação original
        const atividadeAtualizada = {
          ...atividade,
          dataCriacao: atividadesLocais[index].dataCriacao,
        };

        atividadesLocais[index] = atividadeAtualizada;
        salvarNoStorage();

        Logger.info("Atividades", "Atividade atualizada localmente", {
          id: atividade.id,
        });
        return atividadeAtualizada;
      }

      Logger.error(
        "Atividades",
        `Atividade ID ${atividade.id} não encontrada para atualização`
      );
      throw new Error(`Atividade com ID ${atividade.id} não encontrada`);
    }
  },

  async delete(id) {
    Logger.info("Atividades", `Excluindo atividade ID: ${id}`);
    try {
      // Tenta excluir no backend real
      await api.delete(`/api/atividades/${id}`);
      Logger.info(
        "Atividades",
        `Atividade ${id} excluída do backend com sucesso`
      );

      // Remove do cache local também
      const index = atividadesLocais.findIndex((item) => item.id === id);
      if (index !== -1) {
        atividadesLocais.splice(index, 1);
        salvarNoStorage();
      }

      return true;
    } catch (error) {
      Logger.warn(
        "Atividades",
        `Erro ao excluir atividade ${id} do backend, excluindo localmente:`,
        error
      );

      // Fallback: exclui localmente
      const index = atividadesLocais.findIndex((item) => item.id === id);
      if (index !== -1) {
        atividadesLocais.splice(index, 1);
        salvarNoStorage();
        Logger.info("Atividades", `Atividade ${id} excluída localmente`);
        return true;
      }

      Logger.error(
        "Atividades",
        `Atividade ID ${id} não encontrada para exclusão`
      );
      throw new Error(`Atividade com ID ${id} não encontrada`);
    }
  },
};
