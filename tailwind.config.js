/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neon: "#00f6ff",
        glow: "#7df9ff",
        dark: "#050816",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0,246,255,0.6)",
      },
    },
  },
  plugins: [],
};
