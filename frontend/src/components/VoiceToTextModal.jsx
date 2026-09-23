import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Copy,
  Check,
  Scale,
  Briefcase,
  Trash2,
  Volume2,
  Globe,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const VoiceToTextModal = ({ isOpen, onClose, setCurrentTab }) => {
  const {
    language,
    setLanguage,
    currentLangConfig,
    supportedLanguages,
    t,
  } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [copied, setCopied] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen && isRecording) {
      stopListening();
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setErrorMessage(t('speech_not_supported'));
      return;
    }

    setErrorMessage('');

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentLangConfig.speechCode;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTrans += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript((prev) => (prev ? prev.trim() + ' ' + finalTrans.trim() : finalTrans.trim()));
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please check browser microphone permissions.');
          setIsRecording(false);
        } else if (event.error === 'no-speech') {
          // Keep listening or ignore
        } else {
          setErrorMessage(`Audio input notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage('Could not initialize microphone. Please check browser settings.');
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimText('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Restart recognition with new language code if actively recording
  const handleLanguageChange = (newLangCode) => {
    setLanguage(newLangCode);
    const targetConfig = supportedLanguages.find((l) => l.code === newLangCode);
    if (isRecording && targetConfig) {
      stopListening();
      setTimeout(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = targetConfig.speechCode;
          rec.onstart = () => setIsRecording(true);
          rec.onresult = (event) => {
            let curInterim = '';
            let fTrans = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                fTrans += event.results[i][0].transcript + ' ';
              } else {
                curInterim += event.results[i][0].transcript;
              }
            }
            if (fTrans) {
              setTranscript((prev) => (prev ? prev.trim() + ' ' + fTrans.trim() : fTrans.trim()));
            }
            setInterimText(curInterim);
          };
          rec.onerror = () => setIsRecording(false);
          rec.onend = () => {
            setIsRecording(false);
            setInterimText('');
          };
          recognitionRef.current = rec;
          rec.start();
        }
      }, 250);
    }
  };

  const handleCopy = () => {
    const textToCopy = (transcript + (interimText ? ' ' + interimText : '')).trim();
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToAI = () => {
    const text = (transcript + (interimText ? ' ' + interimText : '')).trim();
    if (!text) return;
    localStorage.setItem('lawshield_initial_query', text);
    if (setCurrentTab) setCurrentTab('ai-assistant');
    onClose();
  };

  const handleCreateCase = () => {
    const text = (transcript + (interimText ? ' ' + interimText : '')).trim();
    if (!text) return;
    localStorage.setItem('lawshield_initial_case_desc', text);
    if (setCurrentTab) setCurrentTab('case-intelligence');
    onClose();
  };

  const handleClear = () => {
    setTranscript('');
    setInterimText('');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  const fullText = (transcript + (interimText ? ' ' + interimText : '')).trim();
  const wordCount = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#fcfbf9]">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${isRecording ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-[#b38b4d] border border-stone-200 shadow-xs'}`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
                {t('voice_modal_title')}
                <span className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 border border-stone-200 font-medium">
                  {currentLangConfig.name} ({currentLangConfig.speechCode})
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('voice_modal_subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-stone-100 transition-colors"
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection Ribbon inside Modal */}
        <div className="px-6 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Intake Language:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#0f172a] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Not supported alert */}
          {!speechSupported && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{t('speech_not_supported')}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Recording Status & Pulse Visualizer */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#fcfbf9] border border-stone-200 rounded-xl relative">
            {/* Audio level bars */}
            <div className="flex items-center space-x-1 mb-4 h-8">
              {[30, 50, 40, 75, 55, 85, 60, 80, 45, 65, 40, 60, 35].map((height, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isRecording 
                      ? 'bg-[#b38b4d] animate-pulse' 
                      : 'bg-stone-300'
                  }`}
                  style={{
                    height: isRecording ? `${height}%` : '25%',
                    animationDelay: `${(i * 0.07).toFixed(2)}s`
                  }}
                />
              ))}
            </div>

            {/* Mic Toggle Button */}
            <button
              onClick={toggleRecording}
              className={`p-4 rounded-full transition-all duration-200 shadow-md ${
                isRecording
                  ? 'bg-red-700 hover:bg-red-800 text-white ring-4 ring-red-100'
                  : 'bg-[#0f172a] hover:bg-[#1e293b] text-white hover:scale-105'
              }`}
              title={isRecording ? t('stop_recording') : t('start_recording')}
            >
              {isRecording ? (
                <MicOff className="w-7 h-7" />
              ) : (
                <Mic className="w-7 h-7 text-[#b38b4d]" />
              )}
            </button>

            <p className="mt-3 text-sm font-semibold text-slate-800">
              {isRecording ? t('listening') : t('click_to_start')}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Active Language: <strong className="text-slate-700">{currentLangConfig.name} ({currentLangConfig.speechCode})</strong>
            </p>
          </div>

          {/* Transcript Text Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#b38b4d]" />
                {t('transcript_label')}
              </span>
              <div className="flex items-center space-x-3">
                <span>{wordCount} {t('words_count')}</span>
                <span>•</span>
                <span>{fullText.length} chars</span>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={transcript + (interimText ? (transcript ? ' ' : '') + interimText : '')}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setInterimText('');
                }}
                placeholder="Spoken words will appear here in real time. You can edit directly..."
                rows={5}
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10 focus:border-[#0f172a] resize-none font-sans leading-relaxed"
              />
              {interimText && (
                <span className="absolute bottom-3 right-3 text-[10px] px-2 py-0.5 rounded bg-amber-50 text-[#b38b4d] font-mono border border-amber-200">
                  listening...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#fcfbf9] border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              disabled={!fullText}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clear_text')}</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!fullText}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                copied
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('copied_toast') : t('copy_text')}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendToAI}
              disabled={!fullText}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-stone-50 text-slate-800 border border-stone-300 shadow-xs disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-[#b38b4d]" />
              <span>{t('send_to_ai')}</span>
            </button>

            <button
              onClick={handleCreateCase}
              disabled={!fullText}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-xs disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t('create_case_from_voice')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
