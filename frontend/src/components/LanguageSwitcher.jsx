import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t, getLanguageLabel } from '../utils/translations';
import { Globe, ChevronDown, X, Check } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = ['hi', 'bhojpuri', 'marathi', 'tamil', 'english', 'hinglish'];

  const handleSelect = (lang) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-transparent/5 hover:bg-transparent/10 rounded-xl transition-all press-effect"
      >
        <Globe size={18} className="text-[var(--text-muted)]" />
        <span className="text-sm text-[var(--text-main)] font-medium">{getLanguageLabel(language)}</span>
        <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-color)] border border-[var(--text-muted)]/20 rounded-2xl shadow-xl overflow-hidden z-50 scale-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--text-muted)]/20">
              <span className="text-sm font-medium text-[var(--text-muted)]">{t('selectLanguage', language)}</span>
              <button onClick={() => setIsOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X size={18} />
              </button>
            </div>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleSelect(lang)}
                className={`w-full px-4 py-3 text-left transition-all press-effect flex items-center justify-between ${
                  language === lang
                    ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]'
                    : 'text-[var(--text-main)] hover:bg-[var(--modal-bg)]'
                }`}
              >
                <span className="font-semibold text-sm">{getLanguageLabel(lang)}</span>
                {language === lang && (
                  <Check size={18} className="text-[var(--accent-blue)]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
