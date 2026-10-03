import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

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
          650: "#1f4a36",
          700: "#1b4030",
          750: "#173a2b",
          800: "#163528",
          850: "#132f23",
          900: "#112a20",
          950: "#0a1a13",
        },
        // Acento dorado/mostaza de la marca
        accent: {
          50: "#fbf6ea",
          100: "#f4e8c8",
          200: "#e9d091",
          300: "#dcb65a",
          400: "#cea03d",
          450: "#c3993e",
          500: "#b8923f",
          600: "#977331",
          700: "#75592a",
          800: "#5c4626",
          900: "#4d3b22",
        },
        stone: {
          250: "#dedbd9",
        },
        // Neutros crema cálidos, tintados hacia el verde de la marca
        cream: {
          50: "#fbfaf6",
          100: "#f5f3ea",
          200: "#ece8d9",
        },
      },
      fontFamily: {
        // DataFudColon solo trae "₡" (D-052, ver globals.css): todo lo demás cae a la de marca.
        sans: ["DataFudColon", "var(--font-sans)", "system-ui", "sans-serif"],
        display: ["DataFudColon", "var(--font-display)", "Georgia", "serif"],
      },
      // Elevación de los paneles. Sombras tintadas con el verde más oscuro de la marca (#0a1a13 y
      // #112a20), nunca gris neutro: sobre el crema, una sombra gris se ve sucia. Cada nivel
      // significa algo: xs = apoyado (botón primario, barra fija), sm = superficie (tarjeta),
      // md = levantado (tarjeta que se toca, al pasar el mouse), lg = encima de la página
      // (cajón, diálogo). No se usan como decoración.
      boxShadow: {
        "panel-xs": "0 1px 2px 0 rgba(10, 26, 19, 0.06)",
        "panel-sm": "0 1px 2px 0 rgba(10, 26, 19, 0.04), 0 2px 8px -2px rgba(17, 42, 32, 0.06)",
        "panel-md": "0 1px 2px 0 rgba(10, 26, 19, 0.05), 0 10px 24px -10px rgba(17, 42, 32, 0.18)",
        "panel-lg": "0 2px 6px -2px rgba(10, 26, 19, 0.12), 0 28px 64px -24px rgba(17, 42, 32, 0.38)",
        // Botón primario: brillo arriba (luz) y sombra corta abajo (apoyado sobre el papel).
        "btn-primary": "inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 1px 2px 0 rgba(10, 26, 19, 0.24)",
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
  plugins: [
    // `hov:` y `group-hov:` = hover solo donde hay mouse de verdad. En el teléfono, un toque
    // dispara :hover y el estado se queda pegado después de soltar. Se usan en los paneles; la
    // landing conserva su `hover:` (está aprobada y no se toca).
    // `user-invalid:` = el campo se marca inválido solo después de que la persona lo tocó o
    // intentó enviar, no al cargar la página con un `required` vacío.
    plugin(({ addVariant }) => {
      addVariant("hov", "@media (hover: hover) and (pointer: fine) { &:hover }");
      addVariant("group-hov", "@media (hover: hover) and (pointer: fine) { :merge(.group):hover & }");
      addVariant("user-invalid", "&:user-invalid");
    }),
  ],
};

export default config;
