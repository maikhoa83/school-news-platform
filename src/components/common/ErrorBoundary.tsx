import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[320px] flex items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-xl my-4">
          <div className="max-w-md text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {this.props.fallbackTitle || 'Đã xảy ra lỗi không mong muốn'}
            </h3>
            <p className="text-sm text-slate-600">
              {this.state.error?.message ||
                'Hệ thống gặp sự cố khi xử lý dữ liệu. Vui lòng tải lại trang hoặc liên hệ quản trị viên.'}
            </p>
            <div className="pt-2">
              <Button variant="primary" onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tải lại giao diện
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
