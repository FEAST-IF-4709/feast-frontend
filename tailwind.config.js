/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Admin Dashboard (existing)
        darkBg: '#13111c',
        cardBg: '#1e1b29',
        primary: '#a855f7',

        // FEAST Landing — Sensory Depth Palette
        feast: {
          sunset: '#C4501A',        // Primary — Sunset Core
          'sunset-light': '#D4622E',
          'sunset-dark': '#A3400F',
          amber: '#D4A843',          // Secondary — Warm Amber
          'amber-light': '#E0BE6A',
          beetroot: '#9B5BA5',       // Tertiary — Beetroot
          'beetroot-light': '#C78DD0',
          bg: '#F6F6F6',             // Background
          surface: '#FFFFFF',        // Surface
          'surface-low': '#FFF8F0',  // Surface Container Low
          'surface-lowest': '#FFF3E6', // Surface Container Lowest (Hero)
          'surface-warm': '#FDF6EE',
          dark: '#1A1A1A',           // Dark text
          'dark-secondary': '#4A4A4A',
          'dark-muted': '#7A7A7A',
        },
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        vietnam: ['"Be Vietnam Pro"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}