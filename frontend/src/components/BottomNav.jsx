import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Home, Scale, Calculator, Wallet, HelpCircle, Sparkles, LogOut } from 'lucide-react';
import { t } from '../utils/translations';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

export default function TopNav() {
  const location = useLocation();
  const { isLight } = useTheme();
  const { language } = useLanguage();
  const { logout } = useAuth();

  const tabs = [
    { path: '/home',       icon: Home,        label: t('home', language) },
    { path: '/compare',    icon: Scale,       label: t('compare', language) },
    { path: '/calculator', icon: Calculator,  label: t('calculator', language) },
    { path: '/my-fds',     icon: Wallet,      label: t('myFds', language) },
    { path: '/help',       icon: HelpCircle,  label: t('help', language) },
  ];

  return (
    <header className={`flex-shrink-0 z-30 border-b flex items-center gap-2 px-3 h-12 ${
      isLight
        ? 'bg-transparent border-slate-200'
        : 'bg-transparent border-white/10'
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-7 h-7 brand-gradient rounded-lg flex items-center justify-center shadow-sm">
          <Sparkles size={13} className="text-[var(--text-main)]" />
        </div>
        <span className={`font-bold text-sm hidden sm:block `}>
          FD Mitra
        </span>
      </div>

      {/* Divider */}
      <div className={`w-px h-5 mx-1 flex-shrink-0 `} />

      {/* Nav tabs — take remaining space */}
      <nav className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-medium transition-all duration-150 press-effect whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? isLight
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-blue-400 bg-blue-500/15'
                  : isLight
                    ? 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--modal-bg)]'
                    : 'text-[var(--text-muted)] hover:text-gray-300 hover:bg-transparent/5'
              }`}
            >
              <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
              {isActive && (
                <span className={`absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full ${
                  ''
                }`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <ThemeToggle />
        <LanguageSwitcher />
        <button
          onClick={logout}
          className={`p-1.5 rounded-lg transition-all press-effect ${
            ''
          }`}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}