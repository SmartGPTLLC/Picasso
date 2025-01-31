/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F4C542',
        accent: {
          teal: '#37A5A8',
          red: '#B03D34',
          purple: '#8B5CF6',
        },
        canvas: '#0f172a',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'button-3d': '0 4px 0 0 rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};