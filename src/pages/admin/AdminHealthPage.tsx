/**
 * Admin Health Check Dashboard Page
 * School News Platform - Step 10.4 Health Dashboard & Final Admin Integration
 *
 * Diagnoses 6 subsystems: Application, Database, Auth, Storage, Configuration, Modules
 * Statuses: HEALTHY | DEGRADED | UNAVAILABLE | UNKNOWN
 *
 * Complies with strict architectural boundary:
 * AdminHealthPage -> useHealth -> healthService -> Data Layer
 * UI NEVER queries database infrastructure directly.
 */

import React from 'react';
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Server,
  Database,
  Key,
  FolderArchive,
  GraduationCap,
  Layers,
  Lock,
  AlertOctagon,
} from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';
import type { HealthStatus, HealthComponentCategory } from '../../types/config';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AdminHealthPage() {
  const {
    report,
    isLoading,
    isRetrying,
    error,
    lastChecked,
    status,
    refetch,
  } = useHealth();

  const getStatusIcon = (st: HealthStatus) => {
    switch (st) {
      case 'HEALTHY':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />;
      case 'DEGRADED':
        return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />;
      case 'UNAVAILABLE':
        return <XCircle className="h-5 w-5 text-red-600 shrink-0" aria-hidden="true" />;
      case 'UNKNOWN':
      default:
        return <HelpCircle className="h-5 w-5 text-slate-500 shrink-0" aria-hidden="true" />;
    }
  };

  const getStatusBadge = (st: HealthStatus) => {
    switch (st) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>HEALTHY</span>
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>DEGRADED</span>
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>UNAVAILABLE</span>
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>UNKNOWN</span>
          </span>
        );
    }
  };

  const getCategoryIcon = (category: HealthComponentCategory | string) => {
    switch (category) {
      case 'application':
        return <Server className="h-4 w-4 text-blue-700" aria-hidden="true" />;
      case 'database':
        return <Database className="h-4 w-4 text-purple-700" aria-hidden="true" />;
      case 'auth':
        return <Key className="h-4 w-4 text-amber-700" aria-hidden="true" />;
      case 'storage':
        return <FolderArchive className="h-4 w-4 text-emerald-700" aria-hidden="true" />;
      case 'configuration':
        return <GraduationCap className="h-4 w-4 text-blue-800" aria-hidden="true" />;
      case 'modules':
        return <Layers className="h-4 w-4 text-indigo-700" aria-hidden="true" />;
      case 'setup':
        return <Lock className="h-4 w-4 text-slate-700" aria-hidden="true" />;
      default:
        return <Activity className="h-4 w-4 text-slate-700" aria-hidden="true" />;
    }
  };

  const getStatusTextLabel = (st: HealthStatus) => {
    switch (st) {
      case 'HEALTHY':
        return 'Hoạt động bình thường';
      case 'DEGRADED':
        return 'Cảnh báo / Suy giảm nhẹ';
      case 'UNAVAILABLE':
        return 'Không khả dụng / Sự cố gián đoạn';
      case 'UNKNOWN':
      default:
        return 'Chưa xác định';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary" className="text-[10px] py-0.5 px-2">
              HEALTH CHECK
            </Badge>
            <span className="text-xs text-slate-500">• Chẩn đoán hệ thống 6 phân tầng</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Kiểm Tra Sức Khỏe Toàn Diện (Health Dashboard)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Theo dõi trạng thái thời gian thực của máy chủ, cơ sở dữ liệu PostgreSQL, xác thực Supabase Auth, tệp tin lưu trữ và các modules chức năng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isLoading || isRetrying}
            aria-label="Kiểm tra lại sức khỏe hệ thống"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${(isLoading || isRetrying) ? 'animate-spin' : ''}`} />
            Kiểm tra lại
          </Button>
        </div>
      </div>

      {/* Error state card if check failed completely */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <AlertOctagon className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="text-sm font-bold">Không thể hoàn tất kiểm tra hệ thống</h2>
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-red-300 text-red-800 hover:bg-red-100 shrink-0"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Overall Health Summary Card */}
      {report && (
        <section
          aria-labelledby="overall-health-heading"
          className={`rounded-xl border p-6 shadow-xs transition-colors ${
            status === 'HEALTHY'
              ? 'bg-emerald-50/40 border-emerald-200'
              : status === 'DEGRADED'
              ? 'bg-amber-50/40 border-amber-200'
              : status === 'UNAVAILABLE'
              ? 'bg-red-50/40 border-red-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                  TRẠNG THÁI TỔNG THỂ HỆ THỐNG
                </span>
                {getStatusBadge(status)}
              </div>
              <h2 id="overall-health-heading" className="text-lg sm:text-xl font-bold text-slate-900">
                {getStatusTextLabel(status)}
              </h2>
              <p className="text-xs text-slate-600">
                Quy tắc tính toán: Hệ thống đạt <span className="font-semibold text-emerald-700">HEALTHY</span> khi toàn bộ 6 phân tầng đều kiểm tra thành công. Nếu có thành phần <span className="font-semibold text-red-700">UNAVAILABLE</span>, hệ thống sẽ cảnh báo gián đoạn dịch vụ.
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-1">
              <div className="flex items-center justify-end gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>
                  Lần kiểm tra gần nhất:{' '}
                  {lastChecked
                    ? new Date(lastChecked).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'N/A'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {report.components.length} / 6 phân tầng đã phân tích
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Loading state indicator */}
      {isLoading && !report ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">
            Đang quét và chẩn đoán toàn diện 6 phân tầng hệ thống...
          </p>
        </div>
      ) : report ? (
        /* 6 Components Grid */
        <section aria-labelledby="components-grid-heading" className="space-y-3">
          <h2 id="components-grid-heading" className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Chi Tiết Các Phân Tầng Vận Hành
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.components.map((comp) => {
              const isHealthy = comp.status === 'HEALTHY';
              const isDegraded = comp.status === 'DEGRADED';
              const isUnavailable = comp.status === 'UNAVAILABLE';

              return (
                <Card
                  key={comp.name}
                  className={`border transition-all shadow-xs ${
                    isHealthy
                      ? 'border-slate-200 hover:border-emerald-300 bg-white'
                      : isDegraded
                      ? 'border-amber-200 bg-amber-50/20'
                      : isUnavailable
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {getCategoryIcon(comp.category)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 leading-tight">
                            {comp.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                            {comp.category}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {getStatusBadge(comp.status)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                      {comp.message}
                    </p>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        <span>
                          {comp.latencyMs !== undefined ? `${comp.latencyMs}ms` : 'N/A'}
                        </span>
                      </div>
                      <span>
                        {new Date(comp.checkedAt).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
