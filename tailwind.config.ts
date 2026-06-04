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
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
