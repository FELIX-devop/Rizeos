/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        secondary: '#0EA5E9',
        accent: '#F97316',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0EA5E9 0%, #7C3AED 50%, #F97316 100%)',
      },
    },
  },
  plugins: [],
};

