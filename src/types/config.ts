/**
 * Configuration, Setup and Health Check Type Definitions
 * School News Platform - Step 03 Foundation
 */

export interface SchoolIdentityConfig {
  school_name: string;
  short_name: string;
  slogan: string;
  logo_url: string;
  favicon_url: string;
  banner_url?: string;
  primary_color: string;
  secondary_color: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  social_links: {
    facebook?: string;
    youtube?: string;
    zalo?: string;
  };
}

export interface BrandingConfig {
  primary_color: string;
  secondary_color: string;
  accent_color?: string;
  custom_css?: string;
}

export interface ModuleSettingItem {
  id?: string;
  module_key: string;
  is_enabled: boolean;
  config: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface SetupState {
  id: string;
  is_completed: boolean;
  current_step: string;
  completed_at: string | null;
  step_data: Record<string, unknown>;
  updated_at: string;
}

export type SetupStepKey =
  | 'welcome'
  | 'environment'
  | 'database'
  | 'migration'
  | 'storage'
  | 'identity'
  | 'admin'
  | 'seed'
  | 'homepage'
  | 'health'
  | 'lock';

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'UNKNOWN';

export type HealthComponentCategory =
  | 'application'
  | 'database'
  | 'auth'
  | 'storage'
  | 'configuration'
  | 'modules'
  | 'setup';

export interface ComponentHealth {
  name: string;
  category: HealthComponentCategory;
  status: HealthStatus;
  message: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
  checkedAt: string;
}

export interface SystemHealthReport {
  overallStatus: HealthStatus;
  components: ComponentHealth[];
  checkedAt: string;
}
