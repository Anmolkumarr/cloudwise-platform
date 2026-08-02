/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0b0e1a",
          panel: "#11152275",
          card: "#131829",
        },
        primary: {
          DEFAULT: "#7c5cfc",
          light: "#9d85ff",
          dark: "#5a3fd6",
        },
        accent: {
          blue: "#3b82f6",
          green: "#22c55e",
          orange: "#f97316",
          red: "#ef4444",
          yellow: "#eab308",
        },
        border: {
          DEFAULT: "#232842",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(124, 92, 252, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
