/**
 * React Hook for Listing Users with Search and Pagination
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { listUsers, getUserStats } from '../services/userService';
import type {
  UserRecord,
  UserFilterParams,
  UserPaginationResult,
  UserStats,
} from '../types/user';

export function useUsers(initialParams: UserFilterParams = {}) {
  const [params, setParams] = useState<UserFilterParams>(initialParams);
  const [data, setData] = useState<UserPaginationResult<UserRecord>>({
    data: [],
    total: 0,
    page: initialParams.page || 1,
    pageSize: initialParams.pageSize || 10,
    totalPages: 0,
  });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUsers = useCallback(async (currentParams: UserFilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listUsers(currentParams);
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách người dùng');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const result = await getUserStats();
      if (isMountedRef.current) {
        setStats(result);
      }
    } catch {
      // Non-blocking for stats
    } finally {
      if (isMountedRef.current) {
        setIsStatsLoading(false);
      }
    }
  }, []);

  // Fetch users when params change
  useEffect(() => {
    fetchUsers(params);
  }, [fetchUsers, params]);

  // Fetch stats initially
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateFilters = useCallback((newParams: Partial<UserFilterParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      // Reset page to 1 if filter parameters change
      page: newParams.page !== undefined ? newParams.page : 1,
    }));
  }, []);

  const refetch = useCallback(() => {
    fetchUsers(params);
    fetchStats();
  }, [fetchUsers, fetchStats, params]);

  return {
    users: data.data,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
    stats,
    isLoading,
    isStatsLoading,
    error,
    params,
    updateFilters,
    refetch,
  };
}
