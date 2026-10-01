/**
 * Audit Statistics Query Hook
 * School News Platform - Step 10.3
 *
 * Computes overall count, success, denied, failure, and security alert numbers.
 */

import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import type { AuditStats } from '../types/audit';

export function useAuditStats() {
  const query = useQuery<AuditStats>({
    queryKey: ['auditStats'],
    queryFn: async () => {
      return auditService.getAuditStats();
    },
    staleTime: 30 * 1000,
    retry: 1,
  });

  return {
    stats: query.data || {
      totalLogs: 0,
      successCount: 0,
      deniedCount: 0,
      failureCount: 0,
      securityAlertCount: 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
