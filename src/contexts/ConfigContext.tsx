/**
 * Configuration Context Provider
 * Supplies authoritative school identity, branding, module states, and setup status
 * School News Platform - Step 03 Foundation
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { SchoolIdentityConfig, BrandingConfig, SetupState } from '../types/config';
import { defaultSchoolIdentity } from '../config/schoolIdentity';
import { configService } from '../services/configService';
import { setupService } from '../services/setupService';

interface ConfigContextValue {
  schoolIdentity: SchoolIdentityConfig;
  branding: BrandingConfig;
  moduleSettings: Record<string, boolean>;
  setupState: SetupState | null;
  isLoadingConfig: boolean;
  isModuleEnabled: (moduleKey: string) => boolean;
  toggleModule: (moduleKey: string, isEnabled: boolean) => Promise<{ success: boolean; error?: string }>;
  updateSchoolIdentity: (identity: Partial<SchoolIdentityConfig>) => Promise<{ success: boolean; error?: string }>;
  updateBranding: (branding: BrandingConfig) => Promise<{ success: boolean; error?: string }>;
  refreshConfig: () => Promise<void>;
  refreshSetupState: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentityConfig>(defaultSchoolIdentity);
  const [branding, setBranding] = useState<BrandingConfig>({
    primary_color: '#1e3a8a',
    secondary_color: '#d97706',
  });
  const [moduleSettings, setModuleSettings] = useState<Record<string, boolean>>({});
  const [setupState, setSetupState] = useState<SetupState | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);

  const refreshConfig = useCallback(async () => {
    setIsLoadingConfig(true);
    try {
      const [identity, brand, modules, setup] = await Promise.all([
        configService.getSchoolIdentity(),
        configService.getBranding(),
        configService.getModuleSettings(),
        setupService.getSetupState(),
      ]);

      setSchoolIdentity(identity);
      setBranding(brand);
      setModuleSettings(modules);
      setSetupState(setup);
    } catch (err) {
      console.warn('[ConfigContext] Exception during config refresh:', err);
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  const refreshSetupState = useCallback(async () => {
    try {
      const state = await setupService.getSetupState();
      setSetupState(state);
    } catch (err) {
      console.warn('[ConfigContext] Exception fetching setup state:', err);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const isModuleEnabled = useCallback(
    (moduleKey: string): boolean => {
      // If module is explicitly set in module_settings, use that value; otherwise default to true for foundation
      if (Object.prototype.hasOwnProperty.call(moduleSettings, moduleKey)) {
        return Boolean(moduleSettings[moduleKey]);
      }
      return true;
    },
    [moduleSettings]
  );

  const toggleModule = async (
    moduleKey: string,
    isEnabled: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await configService.toggleModule(moduleKey, isEnabled);
    if (res.success) {
      setModuleSettings((prev) => ({ ...prev, [moduleKey]: isEnabled }));
    }
    return res;
  };

  const updateSchoolIdentity = async (
    identity: Partial<SchoolIdentityConfig>
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await configService.saveSchoolIdentity(identity);
    if (res.success) {
      setSchoolIdentity((prev) => ({ ...prev, ...identity }));
    }
    return res;
  };

  const updateBranding = async (
    brand: BrandingConfig
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await configService.saveBranding(brand);
    if (res.success) {
      setBranding(brand);
    }
    return res;
  };

  const value = useMemo(
    () => ({
      schoolIdentity,
      branding,
      moduleSettings,
      setupState,
      isLoadingConfig,
      isModuleEnabled,
      toggleModule,
      updateSchoolIdentity,
      updateBranding,
      refreshConfig,
      refreshSetupState,
    }),
    [
      schoolIdentity,
      branding,
      moduleSettings,
      setupState,
      isLoadingConfig,
      isModuleEnabled,
      refreshConfig,
      refreshSetupState,
    ]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
