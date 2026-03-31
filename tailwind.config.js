/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488'
        },
        surface: {
          DEFAULT: '#f4f6f8',
          card: '#ffffff',
          elevated: '#fafbfc'
        }
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(15, 23, 42, 0.18)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.35)'
      },
      keyframes: {
        floatSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      animation: {
        'float-soft': 'floatSoft 5.5s ease-in-out infinite',
        shimmer: 'shimmer 8s linear infinite'
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
