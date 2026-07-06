import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0053FF",
          "blue-light": "#4C8AE7",
          yellow: "#F7CE00",
          ink: "#4C4C4C",
          paper: "#FBFCFF",
        },
        ink: {
          900: "#26282E",
          700: "#4C4C4C",
          500: "#8B8D93",
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-noto-sans)", "sans-serif"],
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(0,83,255,0.08) 0%, rgba(0,83,255,0) 60%)",
        "brand-gradient": "linear-gradient(135deg, #0053FF 0%, #4C8AE7 100%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        "scroll-wheel": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(14px)", opacity: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        blob: "blob 12s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "scroll-wheel": "scroll-wheel 1.5s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
