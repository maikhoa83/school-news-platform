/**
 * Audit Logs List Query Hook
 * School News Platform - Step 10.3
 *
 * Connects UI to auditService.listAuditLogs via TanStack Query.
 */

import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import type {
  AuditFilterParams,
  AuditPaginationResult,
  AuditLogRecord,
} from '../types/audit';

export function useAuditLogs(params: AuditFilterParams = {}) {
  const query = useQuery<AuditPaginationResult<AuditLogRecord>>({
    queryKey: ['auditLogs', params],
    queryFn: async () => {
      return auditService.listAuditLogs(params);
    },
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    logs: query.data?.data || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    pageSize: query.data?.pageSize || 20,
    totalPages: query.data?.totalPages || 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ? (query.error instanceof Error ? query.error.message : 'Lỗi khi tải nhật ký kiểm toán') : null,
    refetch: query.refetch,
  };
}
