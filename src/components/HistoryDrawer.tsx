import React from 'react';
import { X, Clock, Trash2, ArrowRight, Copy, Check, Sparkles, Cpu } from 'lucide-react';

export interface HistoryItem {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  sourceLang: 'ar' | 'en';
  targetLang: 'ar' | 'en';
  source: 'ai' | 'engine';
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onClear,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Recent Conversions
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {items.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer flex items-center gap-1 mr-1"
                title="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <Clock className="w-8 h-8 stroke-1 mb-2 opacity-50" />
              <p className="text-sm font-medium">No conversion history yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Your successful conversions will appear here for quick access.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all cursor-pointer relative"
              >
                <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="uppercase text-slate-600 dark:text-slate-300">
                      {item.sourceLang}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="uppercase text-slate-600 dark:text-slate-300">
                      {item.targetLang}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                      {item.source === 'ai' ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5 text-emerald-500" /> AI
                        </>
                      ) : (
                        <>
                          <Cpu className="w-2.5 h-2.5 text-indigo-400" /> Engine
                        </>
                      )}
                    </span>

                    <button
                      onClick={(e) => handleCopy(e, item.output, item.id)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                      title="Copy output"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p
                  className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-1"
                  dir={item.sourceLang === 'ar' ? 'rtl' : 'ltr'}
                >
                  {item.input}
                </p>
                <p
                  className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2"
                  dir={item.targetLang === 'ar' ? 'rtl' : 'ltr'}
                >
                  {item.output}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
