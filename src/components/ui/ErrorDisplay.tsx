'use client';

import React from 'react';
import { AlertCircle, RefreshCw, AlertTriangle, KeyRound } from 'lucide-react';
import { Card } from './Card';

export interface ErrorDisplayProps {
  message: string;
  code?: string;
  retryable?: boolean;
  onRetry?: () => void;
  variant?: 'card' | 'inline' | 'banner';
}

export function ErrorDisplay({
  message,
  code,
  retryable = true,
  onRetry,
  variant = 'card',
}: ErrorDisplayProps) {
  const isKeyMissing = code === 'API_KEY_MISSING';

  if (variant === 'banner') {
    return (
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
        {retryable && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-rose-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>{message}</span>
        {retryable && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-rose-300 hover:text-white underline ml-2"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <Card className="text-center py-10 px-6 max-w-lg mx-auto my-8 border-rose-500/20 bg-[#17243A]/90">
      <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400">
        {isKeyMissing ? (
          <KeyRound className="w-6 h-6" />
        ) : (
          <AlertTriangle className="w-6 h-6" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        {isKeyMissing ? 'API Key Configuration Required' : 'Unable to Load Weather'}
      </h3>

      <p className="text-slate-300 text-sm mb-6 leading-relaxed">
        {message}
      </p>

      {isKeyMissing && (
        <div className="mb-6 p-3 rounded-lg bg-black/30 border border-white/10 text-xs text-left font-mono text-slate-300">
          <p className="text-slate-400 mb-1"># Add to .env.local:</p>
          <p className="text-blue-300">OPENWEATHER_API_KEY=your_key_here</p>
        </div>
      )}

      {retryable && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </Card>
  );
}
