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

export const setupService = {
  /**
   * Fetch current setup state from public.setup_state
   */
  async getSetupState(): Promise<SetupState> {
    try {
      const { data, error } = await supabase
        .from('setup_state')
        .select('*')
        .eq('id', 'current')
        .maybeSingle();

      if (error) {
        console.warn('[setupService] Error reading setup_state:', error.message);
        return DEFAULT_SETUP_STATE;
      }

      if (!data) {
        return DEFAULT_SETUP_STATE;
      }

      return {
        id: data.id || 'current',
        is_completed: Boolean(data.is_completed),
        current_step: data.current_step || 'welcome',
        completed_at: data.completed_at || null,
        step_data: (data.step_data as Record<string, unknown>) || {},
        updated_at: data.updated_at || new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[setupService] Exception reading setup_state:', err);
      return DEFAULT_SETUP_STATE;
    }
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

      const { error } = await supabase
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

      if (error) {
        return { success: false, error: error.message };
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
      const { error } = await supabase
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

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error locking installation',
      };
    }
  },
};
