/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          secondary: 'var(--background-secondary)',
          card: 'var(--surface-card)',
          hover: 'var(--surface-hover)',
          border: 'var(--border)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          card: 'var(--surface-card)',
          hover: 'var(--surface-hover)',
        },
        theme: {
          DEFAULT: 'var(--border)',
        },
        foreground: {
          DEFAULT: 'var(--foreground)',
          secondary: 'var(--foreground-secondary)',
          muted: 'var(--foreground-muted)',
        },
        mint: {
          DEFAULT: '#00F59B',
          glow: 'rgba(0, 245, 155, 0.25)',
          muted: '#00D184',
          dark: '#007A4D',
          subtle: 'rgba(0, 245, 155, 0.08)',
        },
        violet: {
          DEFAULT: '#6366F1',
          glow: 'rgba(99, 102, 241, 0.25)',
          muted: '#4F46E5',
          subtle: 'rgba(99, 102, 241, 0.1)',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'mint-sm': '0 0 15px -2px rgba(0, 245, 155, 0.15)',
        'mint-md': '0 0 25px -4px rgba(0, 245, 155, 0.22)',
        'violet-sm': '0 0 15px -2px rgba(99, 102, 241, 0.15)',
        'card-elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 1px 1px var(--border)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
