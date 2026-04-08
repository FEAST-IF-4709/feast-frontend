/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#13111c',     
        cardBg: '#1e1b29',     
        primary: '#a855f7',    
      }
    },
  },
  plugins: [],
}