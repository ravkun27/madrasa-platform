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
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        text: "var(--color-text)",
        card: "var(--color-card)",
        cardBorder: "var(--color-card-border)",
        button: "var(--color-button)",
        buttonText: "var(--color-button-text)",
        muted: "var(--color-muted)",
      },
    },
  },
  plugins: [],
};
