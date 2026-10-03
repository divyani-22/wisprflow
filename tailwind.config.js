/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#09080f',
          900: '#100e1a',
          850: '#151322',
          800: '#1c192d',
          700: '#29253f',
          600: '#3a3556',
          500: '#5b5679',
          400: '#8a86a6',
          300: '#b3afca',
          200: '#d5d2e5',
          100: '#eceaf5',
        },
        accent: {
          200: '#ddd6ff',
          300: '#c4b8ff',
          400: '#a996ff',
          500: '#8b74f8',
          600: '#7158e8',
          700: '#5a43c7',
        },
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        ripple: {
          from: { transform: 'scale(1)', opacity: '0.5' },
          to: { transform: 'scale(1.9)', opacity: '0' },
        },
      },
      animation: {
        rise: 'rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        fade: 'fade 0.25s ease-out both',
        float: 'float 4s ease-in-out infinite',
        ripple: 'ripple 1.8s cubic-bezier(0.2, 0.6, 0.3, 1) infinite',
      },
    },
  },
  plugins: [],
};
