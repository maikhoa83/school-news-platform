/**
 * Authentication Context Provider
 * Uses real Supabase Auth session & authoritative RBAC resolution
 * NO mock auth or DEV bypasses
 * School News Platform - Step 03 Foundation
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AuthState, RoleCode, UserProfile } from '../types/auth';

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    profile: null,
    roles: [],
    permissions: [],
    error: null,
  });

  // Resolve profile, roles, and permissions from authoritative Supabase database
  const loadUserAuthorization = async (userId: string, userEmail: string): Promise<UserProfile | null> => {
    try {
      // 1. Fetch user profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.warn('[AuthContext] Error fetching profile:', profileErr.message);
      }

      // 2. Fetch assigned roles
      const { data: userRolesData, error: rolesErr } = await supabase
        .from('user_roles')
        .select('role_id, roles(id, code, name)')
        .eq('user_id', userId);

      if (rolesErr) {
        console.warn('[AuthContext] Error fetching user roles:', rolesErr.message);
      }

      const roles: RoleCode[] = [];
      const roleIds: string[] = [];

      if (userRolesData && Array.isArray(userRolesData)) {
        for (const item of userRolesData) {
          const roleObj = Array.isArray(item.roles) ? item.roles[0] : item.roles;
          if (roleObj?.code) {
            roles.push(roleObj.code as RoleCode);
            roleIds.push(roleObj.id);
          }
        }
      }

      // 3. Fetch permissions from role_permissions
      let permissions: string[] = [];
      if (roles.includes('SUPER_ADMIN')) {
        // Super Admin has wildcard access to all platform permissions
        permissions = ['*'];
      } else if (roleIds.length > 0) {
        const { data: permsData, error: permsErr } = await supabase
          .from('role_permissions')
          .select('permissions(code)')
          .in('role_id', roleIds);

        if (!permsErr && permsData) {
          const permCodes = new Set<string>();
          for (const p of permsData) {
            const permObj = Array.isArray(p.permissions) ? p.permissions[0] : p.permissions;
            if (permObj?.code) {
              permCodes.add(permObj.code);
            }
          }
          permissions = Array.from(permCodes);
        }
      }

      const profile: UserProfile = {
        id: userId,
        email: userEmail,
        full_name: profileData?.full_name || userEmail.split('@')[0],
        avatar_url: profileData?.avatar_url || null,
        phone: profileData?.phone || null,
        is_active: profileData?.is_active ?? true,
        created_at: profileData?.created_at || new Date().toISOString(),
        updated_at: profileData?.updated_at || new Date().toISOString(),
        roles,
        permissions,
      };

      return profile;
    } catch (err) {
      console.error('[AuthContext] Exception resolving user authorization:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;

      if (!currentUser) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          profile: null,
          roles: [],
          permissions: [],
          error: null,
        });
        return;
      }

      const profile = await loadUserAuthorization(currentUser.id, currentUser.email || '');

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: currentUser.id,
          email: currentUser.email || '',
        },
        profile,
        roles: profile?.roles || [],
        permissions: profile?.permissions || [],
        error: null,
      });
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Lỗi đồng bộ hồ sơ người dùng',
      }));
    }
  };

  useEffect(() => {
    // Initial session load
    refreshProfile();

    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await loadUserAuthorization(session.user.id, session.user.email || '');
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: session.user.id,
            email: session.user.email || '',
          },
          profile,
          roles: profile?.roles || [],
          permissions: profile?.permissions || [],
          error: null,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          profile: null,
          roles: [],
          permissions: [],
          error: null,
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await loadUserAuthorization(data.user.id, data.user.email || '');
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: data.user.id,
            email: data.user.email || '',
          },
          profile,
          roles: profile?.roles || [],
          permissions: profile?.permissions || [],
          error: null,
        });
      }

      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi xác thực không xác định';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: msg,
      }));
      return { success: false, error: msg };
    }
  };

  const signOut = async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      await supabase.auth.signOut();
    } finally {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        profile: null,
        roles: [],
        permissions: [],
        error: null,
      });
    }
  };

  const value = useMemo(
    () => ({
      ...authState,
      signIn,
      signOut,
      refreshProfile,
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
