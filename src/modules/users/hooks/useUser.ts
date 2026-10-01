/**
 * React Hook for Single User Detail
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserById } from '../services/userService';
import type { UserRecord } from '../types/user';

export function useUser(userId?: string | null) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserById(userId);
      if (isMountedRef.current) {
        setUser(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải thông tin người dùng');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    error,
    refetch: loadUser,
  };
}
