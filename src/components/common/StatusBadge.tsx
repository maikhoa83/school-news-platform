import React from 'react';
import { Badge } from '../ui/Badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'error' | 'pending' | 'active' | 'inactive';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  switch (status) {
    case 'healthy':
    case 'active':
      return (
        <Badge variant="success" icon={<CheckCircle2 className="h-3 w-3" />}>
          {label || 'Hoạt động tốt'}
        </Badge>
      );
    case 'warning':
      return (
        <Badge variant="warning" icon={<AlertCircle className="h-3 w-3" />}>
          {label || 'Cảnh báo'}
        </Badge>
      );
    case 'error':
    case 'inactive':
      return (
        <Badge variant="danger" icon={<AlertCircle className="h-3 w-3" />}>
          {label || 'Chưa cấu hình / Lỗi'}
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="default" icon={<Clock className="h-3 w-3" />}>
          {label || 'Chờ xử lý'}
        </Badge>
      );
  }
}
