import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-2 bg-slate-900 border border-rose-500/40 rounded-2xl text-slate-100 dir-rtl text-xs space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{this.props.fallbackTitle || 'حدث تنبيه في واجهة هذه النافذة'}</span>
          </div>
          <p className="text-slate-300">
            تم استعادة استقرار النظام وتجنب الخروج. يمكنك إعادة المحاولة أو إغلاق النافذة.
          </p>
          {this.state.error && (
            <div className="p-2 bg-slate-950 rounded-xl font-mono text-[10px] text-rose-300 truncate">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة تحميل النافذة</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
