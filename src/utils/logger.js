// src/utils/logger.js

export const Logger = {
  // Níveis de log
  LEVELS: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  },

  // Configuração atual - pode ser alterada em runtime
  config: {
    currentLevel: process.env.NODE_ENV === "production" ? 2 : 0, // WARN em produção, DEBUG em dev
    enabledModules: ["*"], // Todos os módulos habilitados
    enabled: true, // Sempre habilitado, mas filtrado por nível
  },

  // Verifica se um módulo está habilitado
  isModuleEnabled(module) {
    return (
      this.config.enabled &&
      (this.config.enabledModules.includes("*") ||
        this.config.enabledModules.includes(module))
    );
  },

  // Métodos de log
  debug(module, message, ...args) {
    if (
      this.isModuleEnabled(module) &&
      this.config.currentLevel <= this.LEVELS.DEBUG
    ) {
      console.debug(`[${module}] ${message}`, ...args);
    }
  },

  info(module, message, ...args) {
    if (
      this.isModuleEnabled(module) &&
      this.config.currentLevel <= this.LEVELS.INFO
    ) {
      console.info(`[${module}] ${message}`, ...args);
    }
  },

  warn(module, message, ...args) {
    if (
      this.isModuleEnabled(module) &&
      this.config.currentLevel <= this.LEVELS.WARN
    ) {
      console.warn(`[${module}] ${message}`, ...args);
    }
  },

  error(module, message, ...args) {
    if (
      this.isModuleEnabled(module) &&
      this.config.currentLevel <= this.LEVELS.ERROR
    ) {
      console.error(`[${module}] ${message}`, ...args);
    }
  },

  // Método para desabilitar todos os logs em produção se necessário
  disableInProduction() {
    if (process.env.NODE_ENV === "production") {
      this.config.enabled = false;
    }
  },

  // Método para habilitar apenas módulos específicos
  enableModules(moduleNames) {
    this.config.enabledModules = moduleNames;
  },

  // Método para configurar o nível de log
  setLevel(level) {
    if (level >= 0 && level <= 3) {
      this.config.currentLevel = level;
    }
  },
};

// Configuração inicial - pode ser chamado no main.js
export function setupLogger(options = {}) {
  if (options.level !== undefined) {
    Logger.setLevel(options.level);
  }

  if (options.modules !== undefined) {
    Logger.enableModules(options.modules);
  }

  if (options.disableInProduction) {
    Logger.disableInProduction();
  }
}
