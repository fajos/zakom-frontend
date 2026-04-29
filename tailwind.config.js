/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zakom': {
          DEFAULT: '#0d98ba',      // Primary brand color
          dark: '#0a7a96',          // Darker for hover
          light: '#40b8d4',         // Lighter for backgrounds
          50: '#e6f4f7',
          100: '#cce9ef',
          200: '#99d3df',
          300: '#66bdcf',
          400: '#33a7bf',
          500: '#0d98ba',           // Primary
          600: '#0a7a96',
          700: '#085c72',
          800: '#053d4d',
          900: '#031f29',
        },
        'zakom-gold': {
          DEFAULT: '#c9a03d',
          50: '#f9f2e4',
          100: '#f3e5c9',
          200: '#e7cb93',
          300: '#dbb15d',
          400: '#cf9727',
          500: '#c9a03d',
          600: '#a18031',
          700: '#796025',
          800: '#504018',
          900: '#28200c',
        },
      },
    },
  },
  plugins: [],
}