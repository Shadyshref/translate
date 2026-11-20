import { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { ConverterCard } from './components/ConverterCard';
import { SettingsModal } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import type { HistoryItem } from './components/HistoryDrawer';
import { convertText, detectLanguage } from './lib/smartConverter';
import { AlertCircle, ShieldCheck, Zap } from 'lucide-react';

export function App() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  // Core Conversion States
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState<'ar' | 'en'>('ar');
  const [targetLang, setTargetLang] = useState<'ar' | 'en'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [conversionSource, setConversionSource] = useState<'ai' | 'engine' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Settings & History Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Persistent User Preferences
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('custom-api-key') || '';
  });
  const [apiProvider, setApiProvider] = useState<'auto' | 'gemini' | 'openai' | 'groq'>(() => {
    return (localStorage.getItem('custom-api-provider') as any) || 'auto';
  });

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('conversion-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('conversion-history', JSON.stringify(history));
  }, [history]);

  // Save API Key & Provider to localStorage
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('custom-api-key', key);
  };

  const handleChangeProvider = (provider: 'auto' | 'gemini' | 'openai' | 'groq') => {
    setApiProvider(provider);
    localStorage.setItem('custom-api-provider', provider);
  };

  // Convert Action
  const executeConversion = async (
    textToConvert: string,
    source: 'ar' | 'en',
    target: 'ar' | 'en'
  ) => {
    const trimmed = textToConvert.trim();
    if (!trimmed) {
      setOutputText('');
      setConversionSource(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await convertText(trimmed, source, target, {
        customApiKey: apiKey,
        apiProvider,
      });

      setOutputText(res.result);
      setConversionSource(res.source);

      // Add to History (avoiding duplicates at the top)
      if (res.result) {
        const newItem: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          input: trimmed,
          output: res.result,
          sourceLang: source,
          targetLang: target,
          source: res.source,
        };

        setHistory((prev) => [newItem, ...prev.filter((i) => i.input !== trimmed)].slice(0, 30));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger from Convert Button
  const handleConvert = () => {
    executeConversion(inputText, sourceLang, targetLang);
  };

  // Swap Direction
  const handleSwapDirection = () => {
    const newSource = targetLang;
    const newTarget = sourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);

    // If there is already an output, move it to input and re-convert
    if (outputText) {
      const prevOutput = outputText;
      setInputText(prevOutput);
      setOutputText('');
      executeConversion(prevOutput, newSource, newTarget);
    }
  };

  // Clear All
  const handleClearAll = () => {
    setInputText('');
    setOutputText('');
    setConversionSource(null);
    setError(null);
  };

  // Handle Preset Examples
  const handleSelectExample = (text: string) => {
    const detected = detectLanguage(text);
    const target = detected === 'ar' ? 'en' : 'ar';
    setSourceLang(detected);
    setTargetLang(target);
    setInputText(text);
    executeConversion(text, detected, target);
  };

  // Restore from history
  const handleSelectHistory = (item: HistoryItem) => {
    setInputText(item.input);
    setOutputText(item.output);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setConversionSource(item.source);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('conversion-history');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation Header */}
      <Header
        theme={theme}
        resolvedTheme={resolvedTheme}
        toggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        hasCustomKey={Boolean(apiKey)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Intelligent Context-Aware Two-Way Conversion</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Arabic <span className="text-emerald-600 dark:text-emerald-400">↔</span> English Smart Converter
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Convert Egyptian names, addresses, and multi-word phrases naturally.
            Preserves authentic cultural spellings without mechanical character transliteration.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="w-full max-w-4xl mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Converter Card Component */}
        <div className="w-full max-w-4xl">
          <ConverterCard
            inputText={inputText}
            outputText={outputText}
            sourceLang={sourceLang}
            targetLang={targetLang}
            isLoading={isLoading}
            conversionSource={conversionSource}
            onInputChange={setInputText}
            onConvert={handleConvert}
            onSwapDirection={handleSwapDirection}
            onClearAll={handleClearAll}
            onSelectExample={handleSelectExample}
          />
        </div>

        {/* Features Highlights */}
        <div className="mt-12 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs mb-2.5">
              ع ➔ En
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              Authentic Egyptian Names
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Correctly handles compound names (Abdelrahman, Nour El Din) and surnames with "El" instead of literal transliterations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs mb-2.5">
              📍
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              Egyptian Addresses & Cities
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Translates street, square, and city markers while transliterating geographical proper nouns seamlessly.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs mb-2.5">
              ⚡
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              Zero-Downtime Resilience
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Powered by serverless AI APIs with an intelligent offline linguistic engine fallback that never fails.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Production Ready • Vercel Compatible • No API Keys Exposed</span>
          </div>
          <div>
            Built with React, TypeScript & Tailwind CSS
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        provider={apiProvider}
        onChangeProvider={handleChangeProvider}
        theme={theme}
        setTheme={setTheme}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
      />
    </div>
  );
}

export default App;
