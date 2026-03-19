/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm Notion light theme
        cream: {
          50:  '#FFFCF7',
          100: '#FFF8EE',
          200: '#F5F0E8',
          300: '#E8E2D9',
          400: '#D3CDC4',
        },
        notion: {
          text:   '#37352F',
          muted:  '#9B9A97',
          accent: '#2383E2',
        },
        surface: {
          DEFAULT: '#111827',
          elevated: '#1F2937',
          high: '#374151',
        },
      },
    },
  },
  plugins: [],
}
