/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fyness: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          dark: '#1e1b4b',
          light: '#f5f3ff',
          accent: '#22d3ee'
        }
      }
    },
  },
  plugins: [],
}
