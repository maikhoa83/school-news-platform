/**
 * Environment configuration helper for School News Platform
 * Validates and exposes installation-specific configuration
 * Safe for all browser environments (Zero ReferenceError: process is not defined)
 */

export interface AppEnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appEnv: 'development' | 'staging' | 'production';
  isConfigured: boolean;
}

const safeProcessEnv = typeof process !== 'undefined' && process && process.env ? process.env : {};

export const envConfig: AppEnvConfig = {
  supabaseUrl:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    safeProcessEnv.VITE_SUPABASE_URL ||
    '',
  supabaseAnonKey:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    safeProcessEnv.VITE_SUPABASE_ANON_KEY ||
    '',
  appEnv:
    ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_ENV) ||
      safeProcessEnv.VITE_APP_ENV ||
      'production') as 'development' | 'staging' | 'production',
  get isConfigured() {
    return Boolean(
      this.supabaseUrl &&
      this.supabaseAnonKey &&
      this.supabaseUrl !== 'https://your-school-project.supabase.co' &&
      this.supabaseAnonKey !== 'your-supabase-anon-key'
    );
  },
};
