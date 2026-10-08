/**
 * Setup Service
 * Manages Installation Setup Wizard state and permanent Setup Locking
 * School News Platform - Step 03 Foundation
 */

import { supabase } from '../lib/supabase';
import { SetupState } from '../types/config';

const DEFAULT_SETUP_STATE: SetupState = {
  id: 'current',
  is_completed: false,
  current_step: 'welcome',
  completed_at: null,
  step_data: {},
  updated_at: new Date().toISOString(),
};

const LOCAL_STORAGE_KEY = 'school_setup_state_v1';

export const setupService = {
  /**
   * Fetch current setup state from Supabase or localStorage fallback
   */
  async getSetupState(): Promise<SetupState> {
    try {
      const { data, error } = await supabase
        .from('setup_state')
        .select('*')
        .eq('id', 'current')
        .maybeSingle();

      if (!error && data) {
        const state: SetupState = {
          id: data.id || 'current',
          is_completed: Boolean(data.is_completed),
          current_step: data.current_step || 'welcome',
          completed_at: data.completed_at || null,
          step_data: (data.step_data as Record<string, unknown>) || {},
          updated_at: data.updated_at || new Date().toISOString(),
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        } catch {
          // Ignore localStorage errors
        }
        return state;
      }
    } catch {
      // Supabase not reachable or offline, fallback below
    }

    // Local fallback
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }

    return DEFAULT_SETUP_STATE;
  },

  /**
   * Update current setup step and step progress data
   */
  async updateSetupStep(
    stepKey: string,
    stepData?: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const current = await this.getSetupState();
      if (current.is_completed) {
        return {
          success: false,
          error: 'Hệ thống đã khóa cài đặt (Setup Locked). Không thể thay đổi trạng thái cài đặt.',
        };
      }

      const mergedStepData = {
        ...current.step_data,
        ...(stepData || {}),
      };

      const newState: SetupState = {
        id: 'current',
        is_completed: false,
        current_step: stepKey as any,
        completed_at: null,
        step_data: mergedStepData,
        updated_at: new Date().toISOString(),
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      } catch {
        // Ignore
      }

      try {
        await supabase
          .from('setup_state')
          .upsert(
            {
              id: 'current',
              current_step: stepKey,
              step_data: mergedStepData,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
      } catch {
        // Standalone mode is ok
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error updating setup progress',
      };
    }
  },

  /**
   * Permanently lock the setup wizard upon successful installation
   */
  async lockInstallation(): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      const current = await this.getSetupState();
      const lockedState: SetupState = {
        ...current,
        is_completed: true,
        completed_at: now,
        current_step: 'lock',
        updated_at: now,
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lockedState));
      } catch {
        // Ignore
      }

      try {
        await supabase
          .from('setup_state')
          .upsert(
            {
              id: 'current',
              is_completed: true,
              completed_at: now,
              current_step: 'lock',
              updated_at: now,
            },
            { onConflict: 'id' }
          );
      } catch {
        // Standalone mode is ok
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error locking installation',
      };
    }
  },

  /**
   * Reset setup wizard (used by Super Admin to re-run setup when needed)
   */
  async resetSetup(): Promise<{ success: boolean; error?: string }> {
    try {
      const resetState: SetupState = {
        id: 'current',
        is_completed: false,
        current_step: 'welcome',
        completed_at: null,
        step_data: {},
        updated_at: new Date().toISOString(),
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resetState));
      } catch {
        // Ignore
      }

      try {
        await supabase
          .from('setup_state')
          .upsert(
            {
              id: 'current',
              is_completed: false,
              completed_at: null,
              current_step: 'welcome',
              step_data: {},
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
      } catch {
        // Standalone mode is ok
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error resetting setup',
      };
    }
  },
};
