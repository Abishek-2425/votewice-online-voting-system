/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EDEEFF',
          100: '#DFE1FE',
          200: '#C3C5FD',
          300: '#A5A8FC',
          400: '#898CFB',
          500: '#6366F1',
          600: '#3F43E8',
          700: '#1E22D6',
          800: '#171CA8',
          900: '#12167A',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    },
  },
  plugins: [],
}