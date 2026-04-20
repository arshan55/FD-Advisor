import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import api from '../utils/api';
import { MessageCircle, ChevronRight, BookOpen, Lightbulb, Calculator } from 'lucide-react';

export default function HelpScreen() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isLight } = useTheme();
  const [jargonTerms, setJargonTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTerm, setExpandedTerm] = useState(null);
  const [showSeedhaPuchho, setShowSeedhaPuchho] = useState(false);

  useEffect(() => {
    fetchJargon();
  }, []);

  const fetchJargon = async () => {
    try {
      const response = await api.get('/api/jargon');
      setJargonTerms(response.data);
      localStorage.setItem('fd_mitra_jargon', JSON.stringify(response.data));
    } catch (err) {
      const cached = localStorage.getItem('fd_mitra_jargon');
      if (cached) {
        setJargonTerms(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const getExplanation = (term) => {
    const langKey = `${language}_explanation`;
    return term[langKey] || term.hindi_explanation;
  };

  const getAnalogy = (term) => term.analogy;
  const getExample = (term) => term.numeric_example;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3" />
            <p className={`text-sm `}>Loading glossary...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Info Card */}
            <div className={`border rounded-2xl p-4 mb-2 `}>
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen size={18} className="text-[var(--accent-green)]" />
                <h2 className={`font-bold text-base leading-tight `}>FD Glossary</h2>
              </div>
              <p className={`text-sm leading-relaxed text-[var(--text-muted)]`}>
                {t('glossarySubtitle', language)}
              </p>
            </div>

            {/* Terms List */}
            {jargonTerms.map((term, index) => (
              <div
                key={term.id}
                className={`rounded-xl border overflow-hidden transition-all duration-300 fade-in ${
                  ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() => setExpandedTerm(expandedTerm === term.id ? null : term.id)}
                  className={`w-full p-3 flex justify-between items-center text-left transition-all ${
                    ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[var(--text-main)] font-bold text-sm">{term.term.charAt(0)}</span>
                    </div>
                    <span className={`font-bold text-base `}>{term.term}</span>
                  </div>
                  <ChevronRight
                    className={`transition-transform duration-300 ${
                      expandedTerm === term.id ? 'rotate-90 text-[var(--accent-green)]' : ('')
                    }`}
                    size={16}
                  />
                </button>

                {expandedTerm === term.id && (
                  <div className={`px-3 pb-3 pt-2 space-y-2.5 border-t `}>
                    
                    <div className={`rounded-xl p-3 border bg-[var(--modal-bg)]`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <BookOpen size={14} className="text-[var(--accent-green)]" />
                        <p className={`text-xs font-bold uppercase text-[var(--text-muted)]`}>Simple Language</p>
                      </div>
                      <p className={`text-sm leading-relaxed text-[var(--text-main)]`}>{getExplanation(term)}</p>
                    </div>

                    <div className={`rounded-xl p-3 border bg-[var(--modal-bg)]`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Lightbulb size={14} className="text-[var(--accent-green)]" />
                        <p className={`text-xs font-bold uppercase text-[var(--text-muted)]`}>Real Life Example</p>
                      </div>
                      <p className={`text-sm leading-relaxed text-[var(--text-main)]`}>{getAnalogy(term)}</p>
                    </div>

                    <div className={`rounded-xl p-3 border bg-[var(--modal-bg)]`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calculator size={14} className="text-green-500" />
                        <p className={`text-xs font-bold uppercase text-[var(--text-muted)]`}>With Numbers</p>
                      </div>
                      <p className={`text-sm leading-relaxed text-[var(--text-main)]`}>{getExample(term)}</p>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seedha Puchho FAB */}
      <button
        onClick={() => setShowSeedhaPuchho(true)}
        className="fixed bottom-24 right-4 w-12 h-12 bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] text-[var(--text-main)] shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all press-effect active:scale-95 z-20"
      >
        <MessageCircle size={20} />
      </button>

      {/* Seedha Puchho Modal */}
      {showSeedhaPuchho && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowSeedhaPuchho(false)}>
          <div
            className={`w-full rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto bottom-sheet safe-bottom border-t ${
              ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-8 h-1 rounded-full mx-auto mb-5 `} />

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[var(--modal-bg)]0/10 rounded-lg flex items-center justify-center">
                <MessageCircle size={20} className="text-[var(--accent-green)]" />
              </div>
              <div>
                <h3 className={`font-bold text-base `}>{t('seedhaPuchho', language)}</h3>
                <p className={`text-xs `}>{t('askAnythingAboutFd', language)}</p>
              </div>
            </div>

            <p className={`text-xs mb-5 leading-relaxed `}>
              {t('botReadyToHelp', language)}
            </p>

            <button
              onClick={() => { setShowSeedhaPuchho(false); navigate(-1); /* Note assuming ChatScreen handles direct query or navigate to chat */ }}
              className="w-full py-3 bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] rounded-xl text-[var(--text-main)] font-bold transition-all shadow-sm"
            >
              Open Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
