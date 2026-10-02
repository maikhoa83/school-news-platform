/**
 * React Hook for User Roles
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserById } from '../services/userService';
import type { Role, RoleCode } from '../types/user';

export function useUserRoles(userId?: string | null) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleCodes, setRoleCodes] = useState<RoleCode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUserRoles = useCallback(async () => {
    if (!userId) {
      setRoles([]);
      setRoleCodes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await getUserById(userId);
      if (isMountedRef.current) {
        setRoles(user.roles);
        setRoleCodes(user.role_codes);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải vai trò của người dùng');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    loadUserRoles();
  }, [loadUserRoles]);

  return {
    roles,
    roleCodes,
    isLoading,
    error,
    refetch: loadUserRoles,
  };
}
