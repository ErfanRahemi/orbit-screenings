/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orbit: {
          bg: "#0B0C10",
          card: "#12131A",
          surface: "#181A24",
          border: "rgba(255, 255, 255, 0.08)",
          purple: "#7B2CBF",
          cobalt: "#3A86FF",
          cyan: "#00F0FF",
          gold: "#FFB703",
          emerald: "#06D6A0",
          rose: "#EF476F",
          muted: "#8E9AA8",
          text: "#F8F9FA",
        },
      },
      fontFamily: {
        vazir: ["var(--font-vazirmatn)", "Vazirmatn", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(123, 44, 191, 0.45)",
        "glow-lg": "0 0 45px rgba(58, 134, 255, 0.45)",
        "glow-cyan": "0 0 25px rgba(0, 240, 255, 0.4)",
        "screen-glow": "0 10px 40px rgba(58, 134, 255, 0.35)",
      },
      backgroundImage: {
        "orbit-gradient": "linear-gradient(135deg, #7B2CBF 0%, #3A86FF 100%)",
        "orbit-radial": "radial-gradient(circle at 50% 0%, rgba(123, 44, 191, 0.25) 0%, rgba(11, 12, 16, 0) 70%)",
      },
    },
  },
  plugins: [],
};
