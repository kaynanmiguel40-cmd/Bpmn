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
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // Soft Depth / Glass elevation system
        'glass': '0 1px 1px rgba(15,23,42,0.04), 0 8px 24px -8px rgba(15,23,42,0.12)',
        'glass-lg': '0 1px 1px rgba(15,23,42,0.05), 0 24px 48px -12px rgba(15,23,42,0.18)',
        'glow-blue': '0 8px 32px -8px rgba(59,130,246,0.45)',
        'glow-emerald': '0 8px 32px -8px rgba(16,185,129,0.40)',
        'glow-violet': '0 8px 32px -8px rgba(139,92,246,0.40)',
        'glow-amber': '0 8px 32px -8px rgba(245,158,11,0.40)',
      },
      backgroundImage: {
        'mesh-light': 'radial-gradient(at 0% 0%, rgba(59,130,246,0.10) 0px, transparent 50%), radial-gradient(at 98% 2%, rgba(139,92,246,0.10) 0px, transparent 45%), radial-gradient(at 50% 100%, rgba(56,189,248,0.08) 0px, transparent 55%)',
        'mesh-dark': 'radial-gradient(at 0% 0%, rgba(59,130,246,0.16) 0px, transparent 50%), radial-gradient(at 98% 2%, rgba(139,92,246,0.16) 0px, transparent 45%), radial-gradient(at 50% 100%, rgba(56,189,248,0.10) 0px, transparent 55%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.22,1,0.36,1) both',
        'shimmer': 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
}
