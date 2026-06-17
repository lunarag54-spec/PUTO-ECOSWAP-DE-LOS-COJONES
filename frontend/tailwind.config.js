/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',   // ← Importante para dark mode
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
        dark: '#1f2937',
        light: '#f8fafc',
      },
    },
  },
  plugins: [],
}