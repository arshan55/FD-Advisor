export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode base
        cream: '#F8FAFC',
        'cream-dark': '#F1F5F9',
        // Dark mode base
        'dark-navy': '#0B1220',
        'dark-surface': '#111827',
        // Primary brand (blue - trust/banking)
        brand: {
          light: '#2563EB',
          dark: '#3B82F6',
          glow: '#60A5FA'
        },
        // Financial positive (green)
        gain: {
          light: '#16A34A',
          dark: '#22C55E',
          'bg-light': '#DCFCE7',
          'bg-dark': '#052E1A'
        },
        // Accent (amber - AI)
        accent: {
          light: '#F59E0B',
          dark: '#FBBF24'
        },
        // Error (red)
        error: {
          light: '#DC2626',
          dark: '#EF4444',
          'bg-light': '#FEE2E2',
          'bg-dark': '#3F1D1D'
        },
        // Neutral UI
        'ui-border': '#E2E8F0',
        'ui-divider': '#CBD5E5',
        'ui-input': '#F1F5F9',
        'dark-border': '#1F2937',
        'dark-divider': '#374151',
        'dark-input': '#020617',
        // Text colors
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-primary-dark': '#E5E7EB',
        'text-secondary-dark': '#9CA3AF',
        // Legacy (kept for compatibility)
        navy: '#0A1628',
        saffron: '#FF6B00',
        'saffron-light': '#FF8533'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};