/**
 * Application Environment & Credentials Configuration
 * Reads from process.env / Vite import.meta.env with secure fallback values
 */

export interface AppEnvConfig {
  API_ID: string;
  API_HASH: string;
  TDLIB_API_HASH: string;
  SESSION_SECRET: string;
  GEMINI_API_KEY: string;
  GROQ_API_KEY: string;
  PORT: number;
  APP_URL: string;
  NODE_ENV: string;
}

// Default credentials provided by application configuration
export const DEFAULT_CREDENTIALS = {
  API_ID: '22043994',
  API_HASH: '56f64582b363d367280db96586b97801',
  TDLIB_API_HASH: '56f64582b363d367280db96586b97801',
  SESSION_SECRET: 'tg_session_anwer_foud_secure_key_2026',
  GEMINI_API_KEY: '',
  GROQ_API_KEY: '',
  PORT: 3000,
  APP_URL: '',
  NODE_ENV: 'development',
};

/**
 * Get configuration safely for Node.js / Express backend
 */
export function getServerConfig(): AppEnvConfig {
  const env = typeof process !== 'undefined' && process.env ? process.env : {};

  return {
    API_ID: env.API_ID || env.TELEGRAM_API_ID || DEFAULT_CREDENTIALS.API_ID,
    API_HASH: env.API_HASH || env.TELEGRAM_API_HASH || DEFAULT_CREDENTIALS.API_HASH,
    TDLIB_API_HASH: env.TDLIB_API_HASH || env.API_HASH || DEFAULT_CREDENTIALS.TDLIB_API_HASH,
    SESSION_SECRET: env.SESSION_SECRET || DEFAULT_CREDENTIALS.SESSION_SECRET,
    GEMINI_API_KEY: env.GEMINI_API_KEY || DEFAULT_CREDENTIALS.GEMINI_API_KEY,
    GROQ_API_KEY: env.GROQ_API_KEY || DEFAULT_CREDENTIALS.GROQ_API_KEY,
    PORT: Number(env.PORT) || DEFAULT_CREDENTIALS.PORT,
    APP_URL: env.APP_URL || DEFAULT_CREDENTIALS.APP_URL,
    NODE_ENV: env.NODE_ENV || DEFAULT_CREDENTIALS.NODE_ENV,
  };
}

/**
 * Safe public configuration for client-side UI
 */
export function getClientConfig() {
  let clientEnv: Record<string, string | undefined> = {};
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      clientEnv = import.meta.env;
    }
  } catch {}

  return {
    API_ID: clientEnv.VITE_API_ID || DEFAULT_CREDENTIALS.API_ID,
    API_HASH: clientEnv.VITE_API_HASH || DEFAULT_CREDENTIALS.API_HASH,
    TDLIB_API_HASH: clientEnv.VITE_TDLIB_API_HASH || DEFAULT_CREDENTIALS.TDLIB_API_HASH,
  };
}

export default getServerConfig;
