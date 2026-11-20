import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  ClipboardPaste,
  CheckCheck,
  Loader2,
  Cpu,
} from 'lucide-react';
import { detectLanguage } from '../lib/smartConverter';

interface ConverterCardProps {
  inputText: string;
  outputText: string;
  sourceLang: 'ar' | 'en';
  targetLang: 'ar' | 'en';
  isLoading: boolean;
  conversionSource: 'ai' | 'engine' | null;
  onInputChange: (text: string) => void;
  onConvert: () => void;
  onSwapDirection: () => void;
  onClearAll: () => void;
  onSelectExample: (text: string) => void;
}

export const ConverterCard: React.FC<ConverterCardProps> = ({
  inputText,
  outputText,
  sourceLang,
  targetLang,
  isLoading,
  conversionSource,
  onInputChange,
  onConvert,
  onSwapDirection,
  onClearAll,
  onSelectExample,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-detect language dynamically as user types
  useEffect(() => {
    if (inputText.trim()) {
      const detected = detectLanguage(inputText);
      if (detected !== sourceLang) {
        // Automatically switch direction to match input
        onSwapDirection();
      }
    }
  }, [inputText]);

  // Handle Copy to clipboard
  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  // Handle Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onInputChange(text);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    } catch (e) {
      console.error('Failed to paste:', e);
    }
  };

  // Handle Audio Pronunciation (TTS)
  const handleSpeak = (text: string, lang: 'ar' | 'en') => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter to convert
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onConvert();
    }
  };

  const triggerSwap = () => {
    setIsSwapping(true);
    onSwapDirection();
    setTimeout(() => setIsSwapping(false), 300);
  };

  const detectedBadgeText =
    sourceLang === 'ar' ? 'Arabic (العربية)' : 'English (الإنجليزية)';
  const targetBadgeText =
    targetLang === 'ar' ? 'Arabic (العربية)' : 'English (الإنجليزية)';

  const samplePresets = [
    { label: 'Egyptian Name', text: 'عبد الرحمن محمد أحمد الغوري' },
    { label: 'Egyptian Address', text: 'القاهرة، مدينة نصر، شارع عباس العقاد' },
    { label: 'English Name', text: 'Mohamed Ahmed' },
    { label: 'English Address', text: 'Cairo, Nasr City, Abbas El Akkad Street' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Direction & Swap Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Source Language Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            From:
          </span>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                sourceLang === 'ar' ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
            />
            {detectedBadgeText}
          </div>
        </div>

        {/* Swap Direction Button */}
        <button
          onClick={triggerSwap}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 transition-all duration-300 flex items-center gap-2 text-xs font-medium cursor-pointer shadow-xs"
          title="Swap conversion direction"
          aria-label="Swap conversion direction"
        >
          <ArrowLeftRight
            className={`w-4 h-4 transition-transform duration-300 ${
              isSwapping ? 'rotate-180 scale-110' : ''
            }`}
          />
          <span className="hidden sm:inline">Swap Direction</span>
        </button>

        {/* Target Language Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            To:
          </span>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                targetLang === 'ar' ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
            />
            {targetBadgeText}
          </div>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
          Try examples:
        </span>
        {samplePresets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => onSelectExample(preset.text)}
            className="px-2.5 py-1 text-xs rounded-lg bg-white/70 dark:bg-slate-900/60 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-800 transition text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap cursor-pointer shadow-2xs"
          >
            {preset.text}
          </button>
        ))}
      </div>

      {/* Main Dual Panels (Side-by-Side on Desktop, Stacked on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Area: Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all overflow-hidden min-h-[300px]">
          {/* Input Header */}
          <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Input Text
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {sourceLang === 'ar' ? 'Arabic' : 'English'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePaste}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paste</span>
              </button>

              {inputText && (
                <button
                  onClick={onClearAll}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-xs flex items-center gap-1 cursor-pointer"
                  title="Clear text"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 p-4 flex flex-col relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              dir={sourceLang === 'ar' ? 'rtl' : 'ltr'}
              placeholder="Enter Arabic or English text..."
              className="w-full flex-1 bg-transparent resize-none border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base sm:text-lg leading-relaxed min-h-[180px]"
            />

            {/* Input Footer: Stats & Pronunciation */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100/60 dark:border-slate-800/40">
              <div className="flex items-center gap-2">
                {inputText && (
                  <button
                    onClick={() => handleSpeak(inputText, sourceLang)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    title="Listen to input"
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                <span className="hidden sm:inline text-[11px]">
                  Ctrl + Enter to convert
                </span>
              </div>
              <span className="text-[11px] font-mono">
                {inputText.length} chars • {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
              </span>
            </div>
          </div>
        </div>

        {/* Right Area: Output */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col transition-all overflow-hidden min-h-[300px]">
          {/* Output Header */}
          <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Converted Result
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {targetLang === 'ar' ? 'Arabic' : 'English'}
              </span>
              {conversionSource && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  {conversionSource === 'ai' ? (
                    <>
                      <Sparkles className="w-2.5 h-2.5 text-emerald-500" /> AI Context
                    </>
                  ) : (
                    <>
                      <Cpu className="w-2.5 h-2.5 text-indigo-400" /> Smart Engine
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {outputText && (
                <>
                  <button
                    onClick={() => handleSpeak(outputText, targetLang)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer"
                    title="Pronounce output"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Listen</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Output Content Area */}
          <div className="flex-1 p-4 flex flex-col relative justify-between">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-sm font-medium animate-pulse">
                  Converting intelligently...
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Applying natural naming conventions & geography
                </p>
              </div>
            ) : outputText ? (
              <div
                dir={targetLang === 'ar' ? 'rtl' : 'ltr'}
                className="flex-1 text-slate-900 dark:text-white text-base sm:text-lg leading-relaxed select-all whitespace-pre-wrap font-medium"
              >
                {outputText}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-300 dark:text-slate-600 text-center select-none">
                <Sparkles className="w-8 h-8 stroke-1 mb-2 opacity-50 text-emerald-500/50" />
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  Natural conversion will appear here
                </p>
                <p className="text-xs text-slate-400/80 dark:text-slate-500/80 mt-1 max-w-xs">
                  Context-aware Egyptian spelling for names, addresses, and multi-word phrases
                </p>
              </div>
            )}

            {/* Output Footer */}
            {outputText && (
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100/60 dark:border-slate-800/40">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready to copy
                </span>
                <span className="text-[11px] font-mono">
                  {outputText.length} chars
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          💡 Optimized for Egyptian naming conventions & addresses
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {inputText && (
            <button
              onClick={onClearAll}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}

          <button
            onClick={onConvert}
            disabled={isLoading || !inputText.trim()}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:via-teal-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Convert Intelligently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
