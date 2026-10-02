import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export interface NotFoundStateProps {
  title?: string;
  description?: string;
  returnPath?: string;
  returnText?: string;
}

export function NotFoundState({
  title = '404 - Không tìm thấy trang',
  description = 'Đường dẫn bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác.',
  returnPath = '/',
  returnText = 'Quay về trang chính',
}: NotFoundStateProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-slate-200/70 text-slate-600">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        <div className="pt-2">
          <Link to={returnPath}>
            <Button variant="primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {returnText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
