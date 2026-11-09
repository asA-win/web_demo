/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF8EE',
          100: '#F5EED5',
          200: '#EBD8A4',
          300: '#DEC06F',
          400: '#D4AF37', // signature luxury gold
          500: '#B89225',
          600: '#94721B',
          700: '#705315',
          800: '#4D3710',
          900: '#2A1E09',
        },
        obsidian: {
          950: '#06080B',
          900: '#0B0E14',
          850: '#10141D',
          800: '#161D2B',
          700: '#212B3E',
          600: '#32405A',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.35)',
        'gold-glow-lg': '0 0 45px -5px rgba(212, 175, 55, 0.5)',
      }
    },
  },
  plugins: [],
}
