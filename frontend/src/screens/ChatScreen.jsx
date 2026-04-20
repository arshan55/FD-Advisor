import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useChat } from '../context/ChatContext';
import { t } from '../utils/translations';
import api from '../utils/api';
import { Mic, Send, X, Sparkles, MessageCircle } from 'lucide-react';

export default function ChatScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { messages, addMessage, isTyping, setTyping, clearMessages } = useChat();
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage, language);
    setTyping(true);

    try {
      const response = await api.post('/api/chat/message', {
        message: userMessage,
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

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language === 'bhojpuri' ? 'hi-IN' : language === 'marathi' ? 'mr-IN' : language === 'tamil' ? 'ta-IN' : 'hi-IN';
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
      {/* Slim chat header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ui-border dark:border-white/10 bg-transparent dark:bg-dark-surface flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-saffron to-saffron-light rounded-lg flex items-center justify-center">
            <Sparkles size={15} className="text-[var(--text-main)]" />
          </div>
          <div>
            <p className="text-text-primary dark:text-[var(--text-main)] font-semibold text-sm">FD Mitra AI</p>
            <p className="text-green-500 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <button onClick={clearMessages} className="p-1.5 hover:bg-black/5 dark:hover:bg-transparent/10 rounded-lg transition-all press-effect" title="Clear chat">
          <X className="text-[var(--text-muted)]" size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 fade-in">
            <div className="bg-transparent dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 border border-ui-border dark:border-white/10 rounded-3xl p-8 max-w-md mx-auto shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-saffron to-saffron-light rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                <MessageCircle size={36} className="text-[var(--text-main)]" />
              </div>
              <p className="text-3xl mb-3">👋</p>
              <p className="text-text-primary dark:text-[var(--text-main)] text-lg font-semibold mb-2">{t('seedhaPuchho', language)}</p>
              <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)] text-sm leading-relaxed">
                Koi bhi sawaal puchho - main aapki madad ke liye yahan hoon!
              </p>
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
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'brand-gradient text-[var(--text-main)] rounded-br-md shadow-lg'
                  : 'bg-transparent dark:bg-transparent/10 text-text-primary dark:text-[var(--text-main)] rounded-bl-md border border-ui-border dark:border-white/10'
              }`}
            >
              <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-60 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start fade-in">
            <div className="bg-transparent dark:bg-transparent/10 border border-ui-border dark:border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="typing-dot w-2.5 h-2.5 brand-gradient rounded-full"></span>
                <span className="typing-dot w-2.5 h-2.5 brand-gradient rounded-full"></span>
                <span className="typing-dot w-2.5 h-2.5 brand-gradient rounded-full"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-transparent dark:glass-navy border-t border-ui-border dark:border-white/10 px-4 py-4 safe-bottom flex-shrink-0">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={isSpeaking ? stopVoiceInput : startVoiceInput}
            className={`p-3 rounded-full transition-all press-effect flex-shrink-0 ${
              isSpeaking
                ? 'bg-red-500 text-[var(--text-main)] shadow-lg animate-pulse'
                : 'bg-ui-input dark:bg-transparent/10 text-[var(--text-muted)] hover:text-text-primary dark:hover:text-[var(--text-main)] hover:bg-ui-border dark:hover:bg-transparent/20'
            }`}
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (handleSend(), e.preventDefault())}
            placeholder={t('typeMessage', language)}
            className="flex-1 bg-ui-input dark:bg-transparent/10 rounded-full px-5 py-3 text-text-primary dark:text-[var(--text-main)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-saffron/50 transition-all"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-3 rounded-full transition-all press-effect flex-shrink-0 ${
              input.trim()
                ? 'brand-gradient text-[var(--text-main)] shadow-lg hover:glow-brand'
                : 'bg-ui-input dark:bg-transparent/10 text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
