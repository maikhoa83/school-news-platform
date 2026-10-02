/**
 * useHealth Feature Hook
 * School News Platform - Step 10.4 Health Dashboard & Final Admin Integration
 *
 * Implements architectural boundary:
 * AdminHealthPage -> useHealth -> healthService -> Infrastructure
 * NEVER connects UI directly to supabase.from(...)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { healthService } from '../services/healthService';
import type { SystemHealthReport, HealthStatus } from '../types/config';

export interface UseHealthReturn {
  report: SystemHealthReport | null;
  isLoading: boolean;
  isRetrying: boolean;
  error: string | null;
  lastChecked: string | null;
  status: HealthStatus;
  isHealthy: boolean;
  refetch: () => Promise<void>;
}

export function useHealth(): UseHealthReturn {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runCheck = useCallback(async (isRetry: boolean = false) => {
    if (isRetry) {
      setIsRetrying(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await healthService.runSystemHealthCheck();
      if (isMountedRef.current) {
        setReport(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const sanitized = healthService.sanitizeHealthErrorMessage(err);
        setError(sanitized);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRetrying(false);
      }
    }
  }, []);

  useEffect(() => {
    runCheck(false);
  }, [runCheck]);

  const refetch = useCallback(async () => {
    await runCheck(true);
  }, [runCheck]);

  const status: HealthStatus = report?.overallStatus || (error ? 'UNAVAILABLE' : 'UNKNOWN');
  const isHealthy = status === 'HEALTHY';
  const lastChecked = report?.checkedAt || null;

  return {
    report,
    isLoading,
    isRetrying,
    error,
    lastChecked,
    status,
    isHealthy,
    refetch,
  };
}
