/**
 * Audit Log Detail Query Hook
 * School News Platform - Step 10.3
 *
 * Fetches single audit record by ID for read-only inspection modal.
 */

import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import type { AuditLogRecord } from '../types/audit';

export function useAuditLog(id: string | null) {
  const query = useQuery<AuditLogRecord | null>({
    queryKey: ['auditLog', id],
    queryFn: async () => {
      if (!id) return null;
      return auditService.getAuditLogById(id);
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    log: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? (query.error instanceof Error ? query.error.message : 'Lỗi khi tải chi tiết nhật ký') : null,
    refetch: query.refetch,
  };
}
