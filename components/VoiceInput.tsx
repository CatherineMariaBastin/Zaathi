
import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';

interface VoiceInputProps {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'time' | 'textarea';
  placeholder?: string;
  value: string | number;
  onChange: (value: any) => void;
  lang: Language;
  required?: boolean;
  disableVoice?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  id, label, type = 'text', placeholder, value, onChange, lang, required, disableVoice 
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (disableVoice) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      const langCodes: Record<string, string> = {
        en: 'en-US', ml: 'ml-IN', hi: 'hi-IN', ta: 'ta-IN', kn: 'kn-IN'
      };
      recognitionRef.current.lang = langCodes[lang] || 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (type === 'number') {
           const num = parseFloat(transcript.replace(/[^0-9.]/g, ''));
           if (!isNaN(num)) onChange(num);
        } else {
           onChange(transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [lang, type, disableVoice]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative flex items-center group">
        {type === 'textarea' ? (
          <textarea
            id={id}
            rows={3}
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:outline-none transition-all resize-none pr-12 ${isListening ? 'border-red-400 bg-red-50' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        ) : (
          <input
            id={id}
            type={type}
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:outline-none transition-all pr-12 ${isListening ? 'border-red-400 bg-red-50' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        )}
        {!disableVoice && (
          <button
            type="button"
            onClick={toggleListen}
            className={`absolute right-3 p-2 rounded-full transition-all ${
              isListening ? 'text-red-500 bg-red-100 mic-active scale-110' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
            }`}
            title="Voice input"
          >
            <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;
