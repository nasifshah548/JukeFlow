/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: "#00f6ff",
        dark: "#050816",
        glass: "rgba(255,255,255,0.1)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(0,246,255,0.5)",
      },
    },
  },
  plugins: [],
};
