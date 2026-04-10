/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAFAF5',
        charcoal: '#1C1C1C',
        'primary-green': '#1B6B3A',
        'secondary-green': '#2E8B57',
        'accent-amber': '#F4A300',
        'light-gray': '#F0F0F0',
      },
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
