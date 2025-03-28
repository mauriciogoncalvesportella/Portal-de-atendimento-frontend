// src/utils/cache-manager.js

export const CacheManager = {
  // Versão para o cache - incrementar quando houver mudanças na estrutura
  CACHE_VERSION: "1.0",

  // Prefixo para as chaves de cache
  CACHE_PREFIX: "app_cache_",

  // Gera chave com versão para evitar problemas com atualizações
  getKey(resourceName) {
    return `${this.CACHE_PREFIX}${resourceName}_v${this.CACHE_VERSION}`;
  },

  // Salva dados no cache com timestamp
  saveToCache(resourceName, data) {
    try {
      const cacheItem = {
        timestamp: Date.now(),
        data: data,
      };
      localStorage.setItem(
        this.getKey(resourceName),
        JSON.stringify(cacheItem)
      );
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${resourceName} no cache:`, error);
      return false;
    }
  },

  // Recupera dados do cache com verificação de validade
  getFromCache(resourceName, maxAgeMs = 3600000) {
    // 1 hora padrão
    try {
      const cachedData = localStorage.getItem(this.getKey(resourceName));
      if (!cachedData) {
        return null;
      }

      const cacheItem = JSON.parse(cachedData);
      const now = Date.now();

      // Verifica se o cache expirou
      if (now - cacheItem.timestamp > maxAgeMs) {
        return null;
      }
      return cacheItem.data;
    } catch (error) {
      console.error(`Erro ao ler ${resourceName} do cache:`, error);
      return null;
    }
  },

  // Remove item do cache
  removeFromCache(resourceName) {
    localStorage.removeItem(this.getKey(resourceName));
  },

  // Limpa todo o cache da versão atual
  clearCache() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key.includes(this.CACHE_PREFIX) &&
        key.includes(`_v${this.CACHE_VERSION}`)
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};
