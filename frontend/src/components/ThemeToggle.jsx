import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme, isLight } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl transition-all press-effect bg-ui-input dark:bg-dark-input hover:bg-ui-border dark:hover:bg-dark-border"
      title={''}
    >
      {isLight ? (
        <Moon size={20} className="text-brand-light" />
      ) : (
        <Sun size={20} className="text-accent-dark" />
      )}
    </button>
  );
}