/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fyness: {
          primary: '#3b82f6',
          secondary: '#2563eb',
          dark: '#172554',
          light: '#eff6ff',
          accent: '#38bdf8'
        }
      }
    },
  },
  plugins: [],
}
