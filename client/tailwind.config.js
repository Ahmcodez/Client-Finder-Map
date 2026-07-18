/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#060816',
        panel: '#0d1120',
        accent: '#5eead4',
        neon: '#60a5fa',
        glow: '#a78bfa',
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(94,234,212,0.18)',
        panel: '0 20px 60px rgba(7,10,24,0.45)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
