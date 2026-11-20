import React, { useState } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Check, Trash2, Cpu, Sun, Moon, Laptop } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  provider: 'auto' | 'gemini' | 'openai' | 'groq';
  onChangeProvider: (provider: 'auto' | 'gemini' | 'openai' | 'groq') => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  provider,
  onChangeProvider,
  theme,
  setTheme,
}) => {
  const [localKey, setLocalKey] = useState(apiKey);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(localKey.trim());
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setLocalKey('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Settings & Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Appearance and AI translation provider
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4 text-sm">
          {/* Appearance / Theme Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Appearance (Theme)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-3 py-2 text-xs rounded-xl border text-center font-medium transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-3 py-2 text-xs rounded-xl border text-center font-medium transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`px-3 py-2 text-xs rounded-xl border text-center font-medium transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  theme === 'system'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Laptop className="w-4 h-4 text-slate-400" />
                <span>System</span>
              </button>
            </div>
          </div>
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Preferred Model Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'auto', label: 'Auto (Recommended)' },
                { id: 'gemini', label: 'Google Gemini' },
                { id: 'openai', label: 'OpenAI (GPT-4o)' },
                { id: 'groq', label: 'Groq (Llama 3)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeProvider(item.id as any)}
                  className={`px-3 py-2 text-xs rounded-xl border text-left font-medium transition cursor-pointer flex items-center justify-between ${
                    provider === item.id
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {provider === item.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="apiKeyInput"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Custom API Key (Optional)
              </label>
              {localKey && (
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <input
              id="apiKeyInput"
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="e.g. AIzaSy... or sk-..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-mono"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              When deployed to Vercel, the server automatically reads{' '}
              <code className="text-emerald-600 dark:text-emerald-400 font-mono">GEMINI_API_KEY</code>{' '}
              from environment variables. Adding a key here overrides it locally for your browser session.
            </p>
          </div>

          {/* Privacy & Safety Callout */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200 mb-0.5">
                Privacy Protected
              </p>
              <p className="text-[11px] leading-relaxed">
                Keys entered in your browser are never saved on external servers. If no key is set,
                our built-in intelligent Egyptian linguistic dictionary is used seamlessly.
              </p>
            </div>
          </div>

          {/* Get Gemini Key Link */}
          <div className="flex items-center justify-between text-xs pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              Get a free Gemini API Key <ExternalLink className="w-3 h-3" />
            </a>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Cpu className="w-3 h-3" /> Built-in Offline Engine Active
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            {showSavedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved!
              </>
            ) : (
              'Save & Apply'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
