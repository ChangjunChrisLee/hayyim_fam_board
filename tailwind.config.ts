import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Noto Sans KR'", "sans-serif"],
      },
      colors: {
        pastel: {
          blue: "#BFD7FF",
          "blue-light": "#E8F1FF",
          pink: "#FFD6E0",
          "pink-light": "#FFF0F3",
          lavender: "#E0D7FF",
          "lavender-light": "#F5F2FF",
          mint: "#C7F2E8",
          "mint-light": "#EDFAF6",
          yellow: "#FFF3C4",
          "yellow-light": "#FFFAE8",
        },
      },
      animation: {
        floatUp: 'floatUp 0.8s ease-out forwards',
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s infinite",
        "wiggle": "wiggle 0.5s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "celebration": "celebration 0.6s ease-out",
      },
      keyframes: {
        floatUp: {
          '0%':   { opacity: '1', transform: 'translateY(0) translateX(-50%)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) translateX(-50%)' },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        celebration: {
          "0%": { transform: "scale(0) rotate(-180deg)", opacity: "0" },
          "60%": { transform: "scale(1.2) rotate(10deg)" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 8px 30px rgba(0, 0, 0, 0.10)",
        card: "0 2px 15px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
