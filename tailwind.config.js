/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          pink: '#E1306C',
          purple: '#833AB4',
          orange: '#F77737',
        }
      }
    },
  },
  plugins: [],
} 