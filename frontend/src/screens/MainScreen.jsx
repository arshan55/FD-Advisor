import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import api from '../utils/api';
import { Mic, Send, MessageCircle } from 'lucide-react';

export default function MainScreen() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { messages, addMessage, isTyping, setTyping, clearMessages } = useChat();
  const { isLight } = useTheme();
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const quickReplies = [
    { key: 'fdKyaHotaHai', text: t('fdKyaHotaHai', language) },
    { key: 'kitnaFaydaHoga', text: t('kitnaFaydaHoga', language) },
    { key: 'paisaSafeHai', text: t('paisaSafeHai', language) },
    { key: 'bookingKarnaHai', text: t('bookingKarnaHai', language) }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    addMessage('user', text, language);
    setTyping(true);

    try {
      const response = await api.post('/api/chat/message', {
        message: text,
        language,
        conversationHistory: messages.slice(-10)
      });
      addMessage('assistant', response.data.response, language);
    } catch (err) {
      addMessage('assistant', 'Sorry, mujhe abhi samajh nahi aaya. Kripya dubara try karein.', language);
    } finally {
      setTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    await sendMessage(userMessage);
  };

  const handleQuickReply = async (key) => {
    const text = quickReplies.find(q => q.key === key)?.text || '';
    await sendMessage(text);
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language === 'marathi' ? 'mr-IN' : language === 'tamil' ? 'ta-IN' : (language === 'english' || language === 'hinglish') ? 'en-IN' : 'hi-IN';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsSpeaking(false);
    };

    recognitionRef.current.onerror = () => {
      setIsSpeaking(false);
    };

    recognitionRef.current.onend = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    recognitionRef.current.start();
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setIsSpeaking(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-8 fade-in">
            <div className={`border rounded-3xl p-6 max-w-sm mx-auto shadow-sm `}>
              <div className="w-16 h-16 bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] rounded-full flex items-center justify-center mx-auto mb-4 animate-float shadow-lg">
                <MessageCircle size={28} className="text-[var(--text-main)]" />
              </div>
              <p className="text-2xl mb-1">👋</p>
              <p className={`text-lg font-bold mb-2 `}>{t('welcome', language)}</p>
              <p className={`text-sm leading-relaxed text-[var(--text-muted)]`}>
                {t('welcomeSubtitle', language)}
              </p>
            </div>

            {/* Quick start suggestions */}
            <div className="mt-6 space-y-3">
              <p className={`text-sm font-medium `}>{t('tryAsking', language)}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.key}
                    onClick={() => handleQuickReply(reply.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
                      isLight 
                        ? 'bg-transparent border-slate-200 text-slate-600 hover:text-[var(--accent-green)] hover:border-orange-200' 
                        : 'bg-transparent/5 border-white/10 text-[var(--text-muted)] hover:text-orange-400 hover:border-[var(--accent-green)]/30'
                    }`}
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-[var(--text-main)] shadow-md rounded-br-sm'
                  : `border shadow-sm rounded-bl-sm `
              }`}
            >
              <p className="text-base leading-relaxed">{msg.content}</p>
              <p className="text-xs opacity-60 mt-1 flex items-center justify-end font-medium">
                {new Date(msg.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start fade-in">
            <div className={`border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm `}>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-[var(--modal-bg)]0 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[var(--modal-bg)]0 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 bg-[var(--modal-bg)]0 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Row */}
      <div className="px-3 pb-2 pt-1 border-t border-transparent">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {quickReplies.map((reply) => (
            <button
              key={reply.key}
              onClick={() => handleQuickReply(reply.key)}
              className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                isLight 
                  ? 'bg-[var(--modal-bg)] border-[var(--accent-green)]/30 text-[var(--accent-green)] hover:bg-[var(--accent-blue)]/10' 
                  : 'bg-[var(--modal-bg)]0/10 border-[var(--accent-green)]/30 text-[var(--accent-green)] hover:bg-[var(--modal-bg)]0/20'
              }`}
            >
              <MessageCircle size={14} />
              {reply.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className={`p-3 border-t flex-shrink-0 safe-bottom `}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isSpeaking ? stopVoiceInput : startVoiceInput}
            className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
              isSpeaking
                ? 'bg-red-500 text-[var(--text-main)] shadow-md animate-pulse'
                : ''
            }`}
          >
            <Mic size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (handleSend(), e.preventDefault())}
            placeholder={t('typeMessage', language)}
            className={`flex-1 rounded-full px-4 py-2.5 text-base outline-none transition-all border ${
              isLight 
                ? 'bg-[var(--modal-bg)] border-[var(--text-muted)]/20 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:shadow-sm' 
                : 'bg-transparent/5 border-white/10 text-[var(--text-main)] placeholder-gray-500 focus:border-[var(--accent-green)]/50'
            }`}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-2.5 rounded-full transition-all flex-shrink-0 shadow-sm ${
              input.trim()
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-[var(--text-main)] hover:shadow-md hover:from-[var(--accent-green)] hover:to-[var(--accent-blue)]'
                : ''
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
