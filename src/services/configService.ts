/**
 * Configuration Service
 * Handles data access for site_settings and module_settings via Supabase
 * School News Platform - Step 03 Foundation
 */

import { supabase } from '../lib/supabase';
import { SchoolIdentityConfig, BrandingConfig } from '../types/config';
import { defaultSchoolIdentity } from '../config/schoolIdentity';

/**
 * Fetch a specific site setting by key
 */
async function getSiteSetting<T = unknown>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`[configService] Error fetching setting "${key}":`, error.message);
      return null;
    }

    return (data?.value as T) ?? null;
  } catch (err) {
    console.warn(`[configService] Exception fetching setting "${key}":`, err);
    return null;
  }
}

/**
 * Update or insert a site setting
 */
async function updateSiteSetting<T = unknown>(
  key: string,
  value: T
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error updating site setting',
    };
  }
}

/**
 * Fetch school identity configuration with default fallback
 */
async function getSchoolIdentity(): Promise<SchoolIdentityConfig> {
  const remote = await getSiteSetting<SchoolIdentityConfig>('school_identity');
  if (remote) {
    return {
      ...defaultSchoolIdentity,
      ...remote,
    };
  }
  return defaultSchoolIdentity;
}

/**
 * Save school identity configuration
 */
async function saveSchoolIdentity(
  identity: Partial<SchoolIdentityConfig>
): Promise<{ success: boolean; error?: string }> {
  const current = await getSchoolIdentity();
  const merged = { ...current, ...identity };
  return updateSiteSetting('school_identity', merged);
}

/**
 * Fetch branding configuration
 */
async function getBranding(): Promise<BrandingConfig> {
  const remote = await getSiteSetting<BrandingConfig>('branding');
  if (remote) {
    return remote;
  }
  return {
    primary_color: '#1e3a8a',
    secondary_color: '#d97706',
  };
}

/**
 * Save branding configuration
 */
async function saveBranding(
  branding: Partial<BrandingConfig>
): Promise<{ success: boolean; error?: string }> {
  const current = await getBranding();
  const merged = { ...current, ...branding };
  return updateSiteSetting('branding', merged);
}

/**
 * Fetch all module settings map (module_key -> boolean)
 */
async function getModuleSettingsMap(): Promise<Record<string, boolean>> {
  try {
    const { data, error } = await supabase
      .from('module_settings')
      .select('module_key, is_enabled');

    if (error) {
      console.warn('[configService] Error fetching module_settings:', error.message);
      return {};
    }

    const map: Record<string, boolean> = {};
    if (data) {
      for (const row of data) {
        if (row.module_key) {
          map[row.module_key] = Boolean(row.is_enabled);
        }
      }
    }
    return map;
  } catch (err) {
    console.warn('[configService] Exception fetching module_settings:', err);
    return {};
  }
}

/**
 * Update module enablement status
 */
async function setModuleEnabled(
  moduleKey: string,
  isEnabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('module_settings')
      .upsert(
        {
          module_key: moduleKey,
          is_enabled: isEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'module_key' }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error updating module state',
    };
  }
}

export const configService = {
  getSiteSetting,
  updateSiteSetting,
  getSchoolIdentity,
  saveSchoolIdentity,
  getBranding,
  saveBranding,
  getModuleSettingsMap,
  getModuleSettings: getModuleSettingsMap,
  setModuleEnabled,
  toggleModule: setModuleEnabled,
};
