import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { envConfig } from './env';

// Fallback dummy credentials when not yet provisioned in development
const defaultUrl = envConfig.supabaseUrl || 'https://placeholder.supabase.co';
const defaultKey = envConfig.supabaseAnonKey || 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(defaultUrl, defaultKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface ConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  latencyMs?: number;
  message: string;
  checkedAt: string;
}

/**
 * Health check helper for Supabase connection
 */
export async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  const checkedAt = new Date().toISOString();

  if (!envConfig.isConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      message: 'Chưa cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong file môi trường.',
      checkedAt,
    };
  }

  const start = performance.now();
  try {
    // Attempt lightweight ping to Supabase auth or public health
    const { error } = await supabase.from('site_settings').select('key').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      // If table does not exist yet (before migration), check if server responded
      if (error.code === '42P01') {
        return {
          isConfigured: true,
          isConnected: true,
          latencyMs,
          message: 'Kết nối Supabase thành công! (Bảng site_settings chưa khởi tạo migration).',
          checkedAt,
        };
      }
      return {
        isConfigured: true,
        isConnected: false,
        latencyMs,
        message: `Lỗi truy vấn: ${error.message} (${error.code})`,
        checkedAt,
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      latencyMs,
      message: 'Kết nối Supabase hoạt động bình thường.',
      checkedAt,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      isConfigured: true,
      isConnected: false,
      latencyMs,
      message: err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ Supabase.',
      checkedAt,
    };
  }
}
