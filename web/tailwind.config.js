/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B6B3A",
        secondary: "#2E8B57",
        accent: "#F4A300",
        background: "#FAFAF5",
        text: "#1C1C1C",
        error: "#EF4444"
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
      spacing: {
        '48': '3rem', // For 48px touch targets
      },
      borderRadius: {
        'button': '8px',
        'card': '12px',
      }
    },
  },
  plugins: [],
}
