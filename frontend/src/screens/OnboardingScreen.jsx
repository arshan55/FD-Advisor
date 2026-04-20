import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { t, getLanguageLabel } from '../utils/translations';
import { validatePhone } from '../utils/formatters';
import { Loader2, Sparkles, Shield, Zap } from 'lucide-react';

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState('language');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const { signInWithGoogle, loading, error } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { isLight } = useTheme();

  const handleLanguageSelect = (lang) => {
    changeLanguage(lang);
    setStep('googleAuth');
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // The redirect handles the session start.
      // After coming back from Google, we might need to check if user is already authenticated
    } catch (err) {
      // Error handled in context
    }
  };

  const handleFirstTimeResponse = (hasFD) => {
    if (!hasFD) {
      // Trigger education flow
    }
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream dark:bg-dark-navy relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-light/20 dark:bg-brand-dark/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-light/10 dark:bg-accent-dark/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Language Selection */}
        {step === 'language' && (
          <div className="space-y-8 text-center">
            <div className="space-y-3 fade-in">
              <div className="w-24 h-24 brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
                <Sparkles size={48} className="text-[var(--text-main)]" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-brand-light to-accent-light dark:from-brand-dark dark:to-accent-dark bg-clip-text text-transparent">
                FD Mitra
              </h1>
              <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)] text-lg">
                Your Trusted <span className="text-text-primary dark:text-text-primary-dark font-medium">FD Advisor</span>
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-[var(--text-muted)] dark:text-[var(--text-muted)] text-sm">
                  <Shield size={14} />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] dark:text-[var(--text-muted)] text-sm">
                  <Zap size={14} />
                  <span>Fast</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="glass-card rounded-2xl p-6">
                <p className="text-text-primary dark:text-text-primary-dark text-lg font-medium mb-4">{t('selectLanguage', language)}</p>
                <div className="grid grid-cols-3 gap-3">
                  {['hi', 'bhojpuri', 'marathi', 'tamil', 'english', 'hinglish'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSelect(lang)}
                      className="group p-4 bg-ui-input dark:bg-dark-input rounded-2xl border border-ui-border dark:border-dark-border hover:border-brand-light dark:hover:border-brand-dark transition-all duration-300 press-effect"
                    >
                      <span className="text-2xl block mb-2 font-bold text-brand-light dark:text-brand-dark group-hover:scale-110 transition-transform">
                        {lang === 'hi' && 'हिं'}
                        {lang === 'bhojpuri' && 'भो'}
                        {lang === 'marathi' && 'मर'}
                        {lang === 'tamil' && 'தமிழ்'}
                        {lang === 'english' && 'EN'}
                        {lang === 'hinglish' && 'Hi'}
                      </span>
                      <span className="text-text-primary dark:text-text-primary-dark text-sm font-medium">{getLanguageLabel(lang)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Google Auth Step */}
        {step === 'googleAuth' && (
          <div className="space-y-6 fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-[var(--text-main)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-main)]">Welcome!</h2>
              <p className="text-[var(--text-muted)]">Please sign in with your Google account to continue</p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 bg-transparent hover:bg-gray-100 rounded-xl text-gray-900 font-semibold transition-all press-effect flex items-center justify-center gap-3 shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6" />
                Sign in with Google
              </button>

              {error && (
                <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-xl">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}

        {/* First Time FD Question */}
        {step === 'firstTime' && (
          <div className="space-y-6 fade-in text-center">
            <div className="w-20 h-20 brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-4 animate-float">
              <Sparkles size={40} className="text-[var(--text-main)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-main)]">{t('firstTimeFd', language)}</h2>
            <p className="text-[var(--text-muted)]">Let us know so we can guide you better</p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => handleFirstTimeResponse(false)}
                className="py-5 brand-gradient hover:shadow-xl hover:glow-brand rounded-2xl text-[var(--text-main)] font-semibold transition-all press-effect"
              >
                {t('no', language)}
              </button>
              <button
                onClick={() => handleFirstTimeResponse(true)}
                className="py-5 brand-gradient hover:shadow-xl hover:glow-brand rounded-2xl text-[var(--text-main)] font-semibold transition-all press-effect border border-white/20"
              >
                {t('yes', language)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
