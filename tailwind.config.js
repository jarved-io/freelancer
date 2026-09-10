/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#12141A',
        inksoft: '#5B616E',
        inkfaint: '#8A8F99',
        line: '#E6E8EC',
        linestrong: '#D6D9DF',
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#3F37D1',
          soft: '#EEEDFD',
        },
        success: { DEFAULT: '#15803D', soft: '#E9F7EF' },
        warning: { DEFAULT: '#B45309', soft: '#FDF1E3' },
        danger: { DEFAULT: '#DC2626', soft: '#FDECEC' },
        bgsoft: '#F6F7F9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        cardhover: '0 4px 14px rgba(16,24,40,0.09)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
};
