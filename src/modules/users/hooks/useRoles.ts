/**
 * React Hook for Roles and Permissions
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { listRoles, listPermissions } from '../services/userService';
import type { RoleWithPermissions, Permission } from '../types/user';

export function useRoles() {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesData, permsData] = await Promise.all([
        listRoles(),
        listPermissions(),
      ]);

      if (isMountedRef.current) {
        setRoles(rolesData);
        setPermissions(permsData);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách vai trò');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    roles,
    permissions,
    isLoading,
    error,
    refetch: loadData,
  };
}
