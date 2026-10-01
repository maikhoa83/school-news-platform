/**
 * Environment configuration helper for School News Platform
 * Validates and exposes installation-specific configuration
 */

export interface AppEnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appEnv: 'development' | 'staging' | 'production';
  isConfigured: boolean;
}

export const envConfig: AppEnvConfig = {
  supabaseUrl:
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
    process.env.VITE_SUPABASE_URL ||
    '',
  supabaseAnonKey:
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '',
  appEnv:
    ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_ENV) ||
      process.env.VITE_APP_ENV ||
      'development') as 'development' | 'staging' | 'production',
  get isConfigured() {
    return Boolean(
      this.supabaseUrl &&
      this.supabaseAnonKey &&
      this.supabaseUrl !== 'https://your-school-project.supabase.co' &&
      this.supabaseAnonKey !== 'your-supabase-anon-key'
    );
  },
};
