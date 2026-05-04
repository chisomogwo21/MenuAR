/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #1A5C3A)",
          dark: "var(--color-primary-dark, #004326)",
          container: "var(--color-primary, #1A5C3A)",
        },
        secondary: {
          DEFAULT: "#D4A843", // User specified 'accent/gold'
          container: "#FECE65", // From tokens
        },
        background: "#FAFAF8", // User specified
        surface: {
          DEFAULT: "#F8FAF5", // From tokens
          container: "#ECEFE9",
          low: "#F2F4EF",
          lowest: "#FFFFFF",
        },
        error: "#BA1A1A",
      },
      fontFamily: {
        headline: ["Epilogue", "sans-serif"],
        body: ["Be Vietnam Pro", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem", // rounded-2xl as requested for cards
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
}
