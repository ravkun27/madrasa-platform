/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode using the 'class' strategy
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      transitionProperty: {
        scrollbar: "background, transform",
      },
      colors: {
        // Main colors that will automatically respond to theme changes
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        text: "var(--color-text)",
        card: "var(--color-card)",
        "card-border": "var(--color-card-border)",
        button: "var(--color-button)",
        "button-text": "var(--color-button-text)",
        muted: "var(--color-muted)",

        // Additional theme colors (still automatic with dark mode)
        "orange-light": "var(--color-orange-light)",
        "orange-dark": "var(--color-orange-dark)",
        "blue-light": "var(--color-blue-light)",
        "blue-dark": "var(--color-blue-dark)",
      },
    },
  },
  plugins: [],
};
