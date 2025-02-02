/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode using the 'class' strategy
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      transitionProperty: {
        'scrollbar': 'background, transform',
      },
      transitionDuration: {
        '300': '300ms',
      },
      colors: {
        primary: {
          DEFAULT: '#1D4ED8', // Blue (primary color)
          dark: '#1E40AF', // Darker blue for dark mode
        },
        secondary: {
          DEFAULT: '#F97316', // Orange (secondary color)
          dark: '#C2410C', // Darker orange for dark mode
        },
        accent: {
          DEFAULT: '#234e5a', // Orange (secondary color)
          dark: '#234e5a', // Darker orange for dark mode
        },
        background: {
          DEFAULT: '#FFFFFF', // Light mode background
          dark: '#0F172A', // Dark mode background
        },
        text: {
          DEFAULT: '#1E293B', // Light mode text
          dark: '#F8FAFC', // Dark mode text
        },
      },
    },
  },
  plugins: [],
};