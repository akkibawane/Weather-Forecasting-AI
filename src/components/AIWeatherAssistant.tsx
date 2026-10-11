import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Trash2,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { answerWeatherQuestion } from '../services/aiWeatherService';
import type { ChatMessage } from '../types/weather';

interface AIWeatherAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

const PRESET_QUESTIONS = [
  'Will it rain today?',
  'Should I carry an umbrella?',
  'What should I wear today?',
  'Is today good for outdoor activities?',
  'Should I go for a bike ride at 6 PM?',
  'Will tomorrow be hotter than today?',
  'Is it safe to travel today?',
  'What is the best time to go outside?',
  'Give me a weather summary for this week.',
];

export const AIWeatherAssistant: React.FC<AIWeatherAssistantProps> = ({
  isOpen = true,
  onClose,
  isModal = false,
}) => {
  const { weatherData, geminiApiKey } = useWeather();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Hello! I'm your WeatherAI Assistant. I analyze real-time forecasts, hourly shifts, rain probabilities, and alerts for ${
          weatherData?.location.name || 'your city'
        }. How can I help you plan your day?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || !weatherData) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const answer = await answerWeatherQuestion(textToSend, weatherData, geminiApiKey);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error answering question:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I had trouble analyzing that request. Current weather in ${weatherData.location.name} is ${weatherData.current.temp}°C with ${weatherData.current.condition}. Feel free to ask again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        role: 'assistant',
        content: `Conversation cleared. Ask me anything about conditions in ${weatherData?.location.name || 'your area'}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (isModal && !isOpen) return null;

  return (
    <div
      className={`flex flex-col overflow-hidden bg-slate-950/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl transition-all ${
        isModal
          ? isExpanded
            ? 'fixed inset-2 sm:inset-4 z-50 rounded-2xl sm:rounded-3xl'
            : 'fixed bottom-2 sm:bottom-4 right-2 sm:right-4 left-2 sm:left-auto z-50 w-auto sm:w-[420px] max-w-[calc(100vw-1rem)] h-[540px] sm:h-[600px] max-h-[85vh] rounded-2xl sm:rounded-3xl'
          : 'w-full h-full min-h-[500px] sm:min-h-[560px] rounded-2xl sm:rounded-3xl border border-white/10'
      }`}
    >
      {/* Assistant Header */}
      <div className="px-5 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">WeatherAI Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Active Context: {weatherData?.location.name} ({weatherData?.current.temp}°C)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isModal && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Minimize' : 'Expand full-screen'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick Suggested Questions Chips */}
      <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/60 overflow-x-auto scrollbar-none flex gap-2">
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isTyping}
            className="flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/70 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/40 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-sky-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser
                    ? 'bg-sky-600 text-white'
                    : 'bg-gradient-to-tr from-sky-400 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-900/80 text-slate-100 border border-slate-700/60 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span
                  className={`text-[9px] mt-1.5 block font-mono ${
                    isUser ? 'text-sky-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Real-time Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-400 ml-2 font-medium">
                Analyzing weather patterns...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 bg-slate-900/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Ask anything (e.g. 'Can I go jogging at 7 AM?')..."
            className="w-full pl-4 pr-12 py-2.5 text-xs rounded-2xl bg-slate-950/70 border border-slate-700/80 focus:border-sky-500 text-white placeholder-slate-400 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 p-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-white transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-1.5">
          Context-aware AI reasoning on current conditions, hourly forecast, and severe alerts.
        </p>
      </div>
    </div>
  );
};
