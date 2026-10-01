/**
 * React Hook for Listing System Permissions
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { listPermissions } from '../services/userService';
import type { Permission } from '../types/user';

export function useSystemPermissions() {
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

  const loadPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const perms = await listPermissions();
      if (isMountedRef.current) {
        setPermissions(perms);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách quyền hệ thống');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    isLoading,
    error,
    refetch: loadPermissions,
  };
}
