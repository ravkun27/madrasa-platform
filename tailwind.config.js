/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
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
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        text: "var(--color-text)",
        card: "var(--color-card)",
        "card-border": "var(--color-card-border)",
        button: "var(--color-button)",
        "button-text": "var(--color-button-text)",
        "button-hover": "var(--color-button-hover)", // New variable for hover state
        muted: "var(--color-muted)",

        // Additional theme colors
        "orange-light": "var(--color-orange-light)",
        "orange-dark": "var(--color-orange-dark)",
        "blue-light": "var(--color-blue-light)",
        "blue-dark": "var(--color-blue-dark)",

        // Input Colors
        "input-bg": "var(--color-input-bg)",
        "input-border": "var(--color-input-border)",
        "input-text": "var(--color-input-text)",
        "input-placeholder": "var(--color-input-placeholder)",
        "input-focus": "var(--color-input-focus)",
      },
      borderRadius: {
        "2xl": "var(--border-radius)",
      },
      boxShadow: {
        default: "var(--box-shadow)",
      },
    },
  },
  plugins: [],
};
