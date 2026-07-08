// tailwind.config.(cjs|js)
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:   "#6C00FF", // Electric Indigo
        accent:    "#FF6B6B", // Sunset Coral
        background:"#1E1E2F", // Deep Charcoal
        text:      "#F5F5F5", // Cloud White
        highlight: "#00F5D4", // Aqua Wave
      },
    },
  },
  plugins: [],
};
