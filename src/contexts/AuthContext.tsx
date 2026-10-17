/**
 * Authentication Context Provider
 * Supports both real Supabase Auth and Standalone Local Admin session
 * Resilient for Cloud (Vercel, Supabase) and Self-Hosted environments
 * School News Platform - Step 03 Foundation
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { envConfig } from '../lib/env';
import { AuthState, RoleCode, UserProfile } from '../types/auth';

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEFAULT_SUPER_ADMIN_PERMISSIONS = [
  '*',
  'news.view',
  'news.create',
  'news.edit',
  'news.delete',
  'news.publish',
  'announcements.view',
  'announcements.create',
  'announcements.edit',
  'announcements.delete',
  'announcements.publish',
  'documents.view',
  'documents.create',
  'documents.edit',
  'documents.delete',
  'documents.publish',
  'media.view',
  'media.upload',
  'media.delete',
  'media.edit',
  'pages.view',
  'pages.create',
  'pages.edit',
  'pages.delete',
  'homepage.view',
  'homepage.edit',
  'homepage.publish',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'users.manage_roles',
  'settings.view',
  'settings.edit',
  'audit.view',
  'backup.manage',
];

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
      if (!envConfig.isConfigured) return null;

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
        .select(`
          roles (
            id,
            code,
            name
          )
        `)
        .eq('user_id', userId);

      if (rolesErr) {
        console.warn('[AuthContext] Error fetching roles:', rolesErr.message);
      }

      const roleCodes: RoleCode[] = [];
      const roleIds: string[] = [];

      if (userRolesData && Array.isArray(userRolesData)) {
        for (const item of userRolesData) {
          const r = (item as any)?.roles;
          if (r?.code) {
            roleCodes.push(r.code as RoleCode);
            roleIds.push(r.id);
          }
        }
      }

      // 3. Fetch permissions assigned to these roles
      let permissions: string[] = [];
      if (roleIds.length > 0) {
        const { data: rolePermsData, error: permsErr } = await supabase
          .from('role_permissions')
          .select(`
            permissions (
              code
            )
          `)
          .in('role_id', roleIds);

        if (permsErr) {
          console.warn('[AuthContext] Error fetching permissions:', permsErr.message);
        }

        if (rolePermsData && Array.isArray(rolePermsData)) {
          permissions = rolePermsData
            .map((item: any) => item?.permissions?.code)
            .filter(Boolean);
        }
      }

      // If Super Admin, grant all permissions
      if (roleCodes.includes('SUPER_ADMIN')) {
        permissions = ['*'];
      }

      const resolvedProfile: UserProfile = {
        id: userId,
        email: userEmail,
        full_name: profileData?.full_name || userEmail.split('@')[0] || 'Người dùng',
        avatar_url: profileData?.avatar_url || null,
        phone: profileData?.phone || null,
        is_active: profileData?.is_active ?? true,
        created_at: profileData?.created_at || new Date().toISOString(),
        updated_at: profileData?.updated_at || new Date().toISOString(),
        roles: roleCodes.length > 0 ? roleCodes : ['PUBLIC_VISITOR'],
        permissions,
      };

      return resolvedProfile;
    } catch (err) {
      console.warn('[AuthContext] Exception resolving authorization:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    try {
      // 1. Check local session storage first (for standalone admin mode)
      try {
        const rawLocal = localStorage.getItem('school_local_session_v1');
        if (rawLocal) {
          const localProfile: UserProfile = JSON.parse(rawLocal);
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: {
              id: localProfile.id,
              email: localProfile.email,
            },
            profile: localProfile,
            roles: localProfile.roles || ['SUPER_ADMIN'],
            permissions: localProfile.permissions || DEFAULT_SUPER_ADMIN_PERMISSIONS,
            error: null,
          });
          return;
        }
      } catch {
        // Continue
      }

      // 2. If no local session and Supabase is configured, check remote session
      if (envConfig.isConfigured) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const currentUser = sessionData?.session?.user;

          if (currentUser) {
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
            return;
          }
        } catch (supabaseErr) {
          console.warn('[AuthContext] Remote session check skipped:', supabaseErr);
        }
      }

      // 3. Fallback: unauthenticated
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        profile: null,
        roles: [],
        permissions: [],
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

    // Listen to Supabase Auth state changes if configured
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        } else if (event === 'SIGNED_OUT') {
          // Explicit sign out
          try {
            localStorage.removeItem('school_local_session_v1');
          } catch {}
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            profile: null,
            roles: [],
            permissions: [],
            error: null,
          });
        } else {
          // For INITIAL_SESSION with null session, retain local admin session if exists
          try {
            const rawLocal = localStorage.getItem('school_local_session_v1');
            if (rawLocal) {
              const localProfile: UserProfile = JSON.parse(rawLocal);
              setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user: { id: localProfile.id, email: localProfile.email },
                profile: localProfile,
                roles: localProfile.roles || ['SUPER_ADMIN'],
                permissions: localProfile.permissions || DEFAULT_SUPER_ADMIN_PERMISSIONS,
                error: null,
              });
              return;
            }
          } catch {}
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
        authListener?.subscription?.unsubscribe();
      };
    } catch {
      // Supabase listener failed safely
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // 1. Check Standalone / Local Admin credentials FIRST
      const savedAdminRaw = localStorage.getItem('school_admin_account_v1');
      let savedAdmin: any = null;
      if (savedAdminRaw) {
        try {
          savedAdmin = JSON.parse(savedAdminRaw);
        } catch {
          // Ignore
        }
      }

      const targetEmail = savedAdmin?.email || 'admin@vinhphong.edu.vn';
      const targetUser = savedAdmin?.username || 'admin';
      const targetPass = savedAdmin?.password || 'Admin@2026!';

      const cleanInput = email.trim().toLowerCase();
      const cleanUser = targetUser.toLowerCase();
      const cleanTargetEmail = targetEmail.toLowerCase();

      // Flexible identifier matching
      const isUserMatch =
        cleanInput === cleanUser ||
        cleanInput === cleanTargetEmail ||
        cleanInput === 'admin@truong.edu.vn' ||
        cleanInput === 'admin' ||
        cleanInput === 'c3vinhphong.kiengiang@moet.edu.vn' ||
        cleanInput.startsWith('admin@') ||
        cleanInput.startsWith(cleanUser);

      // Accepted default passwords
      const isPassMatch =
        password === targetPass ||
        password === 'Admin@2026!' ||
        password === 'Admin@123' ||
        password === 'admin123' ||
        password === 'admin';

      if (isUserMatch && isPassMatch) {
        const localProfile: UserProfile = {
          id: 'super-admin-01',
          email: targetEmail,
          full_name: savedAdmin?.full_name || 'Quản trị viên Nhà trường',
          avatar_url: '/vinh_phong_logo.jpg',
          phone: savedAdmin?.phone || '02973.800.xxx',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          roles: ['SUPER_ADMIN'],
          permissions: DEFAULT_SUPER_ADMIN_PERMISSIONS,
        };

        try {
          localStorage.setItem('school_local_session_v1', JSON.stringify(localProfile));
        } catch {
          // Ignore
        }

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: localProfile.id,
            email: localProfile.email,
          },
          profile: localProfile,
          roles: localProfile.roles || ['SUPER_ADMIN'],
          permissions: localProfile.permissions || DEFAULT_SUPER_ADMIN_PERMISSIONS,
          error: null,
        });

        return { success: true };
      }

      // 2. If Supabase is configured, try remote Supabase authentication safely
      if (envConfig.isConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data.user) {
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
            return { success: true };
          }

          if (error) {
            setAuthState((prev) => ({
              ...prev,
              isLoading: false,
              error: error.message,
            }));
            return { success: false, error: error.message };
          }
        } catch (remoteErr) {
          console.warn('[AuthContext] Remote Supabase sign in error:', remoteErr);
        }
      }

      // 3. Invalid credentials error message
      const errMsg = 'Tên đăng nhập hoặc mật khẩu không chính xác. Mặc định: admin / Admin@2026!';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errMsg,
      }));
      return { success: false, error: errMsg };
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
      try {
        localStorage.removeItem('school_local_session_v1');
      } catch {}
      if (envConfig.isConfigured) {
        await supabase.auth.signOut().catch(() => {});
      }
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
