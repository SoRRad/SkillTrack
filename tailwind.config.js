/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#2dd4bf',
          500: '#14b8a6'
        }
      }
    }
  },
  darkMode: 'class',
  plugins: []
};
