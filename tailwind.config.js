/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono:    ["'Space Mono'", "monospace"],
        display: ["'Orbitron'", "sans-serif"],
        body:    ["'IBM Plex Sans'", "sans-serif"],
      },
      colors: {
        void:    "#04050a",
        panel:   "#0a0d16",
        border:  "#1a2035",
        accent:  "#00d4ff",
        gold:    "#f5a623",
        danger:  "#ff3b5c",
        success: "#00e676",
        muted:   "#4a5578",
        text:    "#c8d6f0",
      },
      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow":        "glow 2s ease-in-out infinite alternate",
        "scan":        "scan 4s linear infinite",
        "fade-in":     "fadeIn 0.5s ease forwards",
        "slide-up":    "slideUp 0.4s ease forwards",
        "count-tick":  "countTick 1s ease infinite",
      },
      keyframes: {
        glow: {
          "0%":   { textShadow: "0 0 10px #00d4ff, 0 0 20px #00d4ff" },
          "100%": { textShadow: "0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 60px #00d4ff" },
        },
        scan: {
          "0%":   { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        countTick: {
          "0%, 100%": { opacity: 1 },
          "50%":      { opacity: 0.5 },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
