/**
 * Health Check Service
 * Diagnoses 6 core platform tiers: Application, Database, Auth, Storage, Configuration, Modules
 * Status: HEALTHY | DEGRADED | UNAVAILABLE | UNKNOWN
 * School News Platform - Step 10.4 Health Dashboard & Final Admin Integration
 */

import { supabase } from '../lib/supabase';
import { envConfig } from '../lib/env';
import { SystemHealthReport, ComponentHealth, HealthStatus } from '../types/config';

/**
 * Pure function to sanitize user-visible error messages.
 * Prevents accidental leakage of tokens, passwords, database URLs or privileged keys.
 */
export function sanitizeHealthErrorMessage(err: unknown): string {
  if (!err) return 'Lỗi không xác định';
  let message = typeof err === 'string' ? err : err instanceof Error ? err.message : String(err);
  
  // Strip any JWT tokens / Bearer strings
  message = message.replace(/Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, '[REDACTED_TOKEN]');
  // Strip password in database URLs
  message = message.replace(/(postgres(?:ql)?:\/\/[^:]+:)[^@]+(@)/gi, '$1[REDACTED_PASSWORD]$2');
  // Strip apiKey or secret query params
  message = message.replace(/([?&](?:apikey|secret|key|token)=)[^&]+/gi, '$1[REDACTED]');
  // Strip local absolute paths
  message = message.replace(/(?:\/[a-zA-Z0-9._-]+)+/g, (match) => {
    if (match.startsWith('/admin') || match.startsWith('/login') || match.startsWith('/api')) {
      return match;
    }
    return '[REDACTED_PATH]';
  });

  return message;
}

/**
 * Deterministic status aggregation rule:
 * 1. UNAVAILABLE takes highest precedence (critical tier down)
 * 2. DEGRADED takes second precedence (partial issue detected)
 * 3. UNKNOWN takes third precedence (insufficient evidence)
 * 4. HEALTHY only when 100% of components are HEALTHY
 */
export function aggregateHealthStatus(components: ComponentHealth[]): HealthStatus {
  if (components.length === 0) {
    return 'UNKNOWN';
  }
  if (components.some((c) => c.status === 'UNAVAILABLE')) {
    return 'UNAVAILABLE';
  }
  if (components.some((c) => c.status === 'DEGRADED')) {
    return 'DEGRADED';
  }
  if (components.some((c) => c.status === 'UNKNOWN')) {
    return 'UNKNOWN';
  }
  return 'HEALTHY';
}

export const healthService = {
  aggregateHealthStatus,
  sanitizeHealthErrorMessage,

  /**
   * Run comprehensive health checks across all six subsystems:
   * 1. Application
   * 2. Database
   * 3. Authentication
   * 4. Storage
   * 5. Configuration
   * 6. Modules
   */
  async runSystemHealthCheck(): Promise<SystemHealthReport> {
    const checkedAt = new Date().toISOString();
    const components: ComponentHealth[] = [];

    // 1. Application Layer Check
    const isAppHealthy = Boolean(envConfig.appEnv);
    components.push({
      name: 'Khung Ứng Dụng (Application Runtime)',
      category: 'application',
      status: isAppHealthy ? 'HEALTHY' : 'DEGRADED',
      message: isAppHealthy
        ? `Nền tảng vận hành ở môi trường [${envConfig.appEnv.toUpperCase()}], kết nối SPA tối ưu.`
        : 'Cấu hình môi trường ứng dụng chưa hoàn thiện hoặc đang chạy cấu hình mặc định.',
      details: {
        environment: envConfig.appEnv,
        runtime: 'Vite + React 18',
        nodeEnv: process.env.NODE_ENV || 'development',
      },
      checkedAt,
    });

    // 2. Database Connection Check
    const dbStart = performance.now();
    try {
      if (!envConfig.isConfigured) {
        components.push({
          name: 'Cơ Sở Dữ Liệu (PostgreSQL / Supabase)',
          category: 'database',
          status: 'UNKNOWN',
          message: 'Chưa cấu hình biến môi trường kết nối Supabase thực tế.',
          latencyMs: 0,
          details: { configured: false },
          checkedAt,
        });
      } else {
        const { error } = await supabase.from('site_settings').select('key').limit(1);
        const dbLatency = Math.round(performance.now() - dbStart);

        if (error) {
          const isTableMissing = error.code === '42P01';
          const isConnectionError = error.message?.toLowerCase().includes('failed to fetch') ||
            error.message?.toLowerCase().includes('network') ||
            error.code === 'ECONNREFUSED';

          components.push({
            name: 'Cơ Sở Dữ Liệu (PostgreSQL / Supabase)',
            category: 'database',
            status: isConnectionError ? 'UNAVAILABLE' : 'DEGRADED',
            message: isTableMissing
              ? 'Kết nối thành công nhưng bảng site_settings chưa khởi tạo schema migration.'
              : sanitizeHealthErrorMessage(`Lỗi truy vấn: ${error.message} (${error.code})`),
            latencyMs: dbLatency,
            details: { errorCode: error.code },
            checkedAt,
          });
        } else {
          components.push({
            name: 'Cơ Sở Dữ Liệu (PostgreSQL / Supabase)',
            category: 'database',
            status: 'HEALTHY',
            message: `Kết nối hoạt động ổn định, phản hồi trong ${dbLatency}ms.`,
            latencyMs: dbLatency,
            details: { latencyMs: dbLatency },
            checkedAt,
          });
        }
      }
    } catch (err) {
      components.push({
        name: 'Cơ Sở Dữ Liệu (PostgreSQL / Supabase)',
        category: 'database',
        status: 'UNAVAILABLE',
        message: sanitizeHealthErrorMessage(err instanceof Error ? err.message : 'Ngoại lệ khi kết nối Database'),
        latencyMs: Math.round(performance.now() - dbStart),
        checkedAt,
      });
    }

    // 3. Authentication Subsystem Check
    const authStart = performance.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      const authLatency = Math.round(performance.now() - authStart);

      if (error) {
        components.push({
          name: 'Hệ Thống Xác Thực (Supabase Auth & RBAC)',
          category: 'auth',
          status: 'DEGRADED',
          message: sanitizeHealthErrorMessage(`Dịch vụ xác thực phản hồi lỗi: ${error.message}`),
          latencyMs: authLatency,
          checkedAt,
        });
      } else {
        components.push({
          name: 'Hệ Thống Xác Thực (Supabase Auth & RBAC)',
          category: 'auth',
          status: 'HEALTHY',
          message: data.session
            ? 'Phiên làm việc cán bộ đã xác thực an toàn.'
            : 'Dịch vụ Auth sẵn sàng, hiện chưa có phiên đăng nhập.',
          latencyMs: authLatency,
          details: { hasActiveSession: Boolean(data.session) },
          checkedAt,
        });
      }
    } catch (err) {
      components.push({
        name: 'Hệ Thống Xác Thực (Supabase Auth & RBAC)',
        category: 'auth',
        status: 'UNAVAILABLE',
        message: sanitizeHealthErrorMessage(err instanceof Error ? err.message : 'Không thể kết nối đến Auth endpoint'),
        latencyMs: Math.round(performance.now() - authStart),
        checkedAt,
      });
    }

    // 4. Storage Subsystem Check
    const storageStart = performance.now();
    try {
      const { data, error } = await supabase.storage.listBuckets();
      const storageLatency = Math.round(performance.now() - storageStart);

      if (error) {
        components.push({
          name: 'Lưu Trữ Tệp Tin & Media (Supabase Storage)',
          category: 'storage',
          status: 'DEGRADED',
          message: sanitizeHealthErrorMessage(`Không thể đọc danh sách Storage buckets: ${error.message}`),
          latencyMs: storageLatency,
          checkedAt,
        });
      } else {
        components.push({
          name: 'Lưu Trữ Tệp Tin & Media (Supabase Storage)',
          category: 'storage',
          status: 'HEALTHY',
          message: 'Hạ tầng lưu trữ media & văn bản sẵn sàng hoạt động.',
          latencyMs: storageLatency,
          details: { bucketCount: data?.length || 0 },
          checkedAt,
        });
      }
    } catch (err) {
      components.push({
        name: 'Lưu Trữ Tệp Tin & Media (Supabase Storage)',
        category: 'storage',
        status: 'DEGRADED',
        message: sanitizeHealthErrorMessage(err instanceof Error ? err.message : 'Dịch vụ lưu trữ chưa sẵn sàng'),
        latencyMs: Math.round(performance.now() - storageStart),
        checkedAt,
      });
    }

    // 5. Configuration Subsystem Check
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'school_identity')
        .maybeSingle();

      if (error) {
        components.push({
          name: 'Hồ Sơ Nhận Diện & Cấu Hình Trường Học',
          category: 'configuration',
          status: 'DEGRADED',
          message: 'Đang áp dụng bộ cấu hình mặc định an toàn.',
          checkedAt,
        });
      } else {
        const hasCustomIdentity = Boolean(data?.value);
        components.push({
          name: 'Hồ Sơ Nhận Diện & Cấu Hình Trường Học',
          category: 'configuration',
          status: hasCustomIdentity ? 'HEALTHY' : 'DEGRADED',
          message: hasCustomIdentity
            ? 'Đã cấu hình thông tin định danh và nhận diện thương hiệu riêng cho trường.'
            : 'Đang áp dụng bộ nhận diện tiêu chuẩn mẫu (có thể tùy biến tại Cấu hình CMS).',
          details: { customized: hasCustomIdentity },
          checkedAt,
        });
      }
    } catch {
      components.push({
        name: 'Hồ Sơ Nhận Diện & Cấu Hình Trường Học',
        category: 'configuration',
        status: 'DEGRADED',
        message: 'Đang dùng bộ cấu hình mặc định an toàn.',
        checkedAt,
      });
    }

    // 6. Modules Subsystem Check (Module Registry & Enablement)
    try {
      const { data, error } = await supabase
        .from('module_settings')
        .select('module_key, is_enabled');

      if (error) {
        components.push({
          name: 'Hệ Thống Modules Chức Năng (Module Registry)',
          category: 'modules',
          status: 'DEGRADED',
          message: sanitizeHealthErrorMessage(`Không thể truy vấn bảng module_settings: ${error.message}`),
          checkedAt,
        });
      } else {
        const items = data || [];
        const enabledCount = items.filter((m) => m.is_enabled).length;
        components.push({
          name: 'Hệ Thống Modules Chức Năng (Module Registry)',
          category: 'modules',
          status: 'HEALTHY',
          message: `Hệ thống modules vận hành đồng bộ (${enabledCount}/${items.length} module đang kích hoạt).`,
          details: {
            totalModules: items.length,
            enabledModules: enabledCount,
          },
          checkedAt,
        });
      }
    } catch (err) {
      components.push({
        name: 'Hệ Thống Modules Chức Năng (Module Registry)',
        category: 'modules',
        status: 'DEGRADED',
        message: sanitizeHealthErrorMessage(err instanceof Error ? err.message : 'Lỗi kiểm tra trạng thái module'),
        checkedAt,
      });
    }

    // Determine overall status using deterministic aggregation rule
    const overallStatus = aggregateHealthStatus(components);

    return {
      overallStatus,
      components,
      checkedAt,
    };
  },
};
