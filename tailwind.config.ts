import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Verde bosque de la marca DataFud
        brand: {
          50: "#f0f7f3",
          100: "#dcede4",
          200: "#bbdcca",
          300: "#8fc3a8",
          400: "#5aa07f",
          500: "#2e6f4e",
          600: "#22503a",
          700: "#1b4030",
          800: "#163528",
          900: "#112a20",
        },
        // Acento dorado/mostaza de la marca
        accent: {
          50: "#fbf6ea",
          100: "#f4e8c8",
          200: "#e9d091",
          300: "#dcb65a",
          400: "#cea03d",
          500: "#b8923f",
          600: "#977331",
          700: "#75592a",
          800: "#5c4626",
          900: "#4d3b22",
        },
        // Neutros crema cálidos, tintados hacia el verde de la marca
        cream: {
          50: "#fbfaf6",
          100: "#f5f3ea",
          200: "#ece8d9",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.23, 1, 0.32, 1) both",
        "fade-in": "fade-in 0.6s ease both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
