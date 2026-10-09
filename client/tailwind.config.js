/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: "#080B0A",
          secondary: "#0C100E",
          card: "#111715",
          surface: "#111715",
          hover: "#17201C",
          elevated: "#171E1A",
          border: "#1F2B25",
          "border-subtle": "#16221D",
        },
        accent: {
          lime: "#C6FF5E",
          "lime-hover": "#B3ED4B",
          "lime-dim": "rgba(198, 255, 94, 0.12)",
          emerald: "#39D98A",
          "emerald-hover": "#2FC278",
          "emerald-dim": "rgba(57, 217, 138, 0.12)",
        },
        status: {
          expired: "#FF5C5C",
          "expired-bg": "rgba(255, 92, 92, 0.12)",
          urgent: "#FFB020",
          "urgent-bg": "rgba(255, 176, 32, 0.12)",
          month: "#38BDF8",
          "month-bg": "rgba(56, 189, 248, 0.12)",
          valid: "#39D98A",
          "valid-bg": "rgba(57, 217, 138, 0.12)",
          none: "#929B96",
          "none-bg": "rgba(146, 155, 150, 0.12)",
        },
        text: {
          primary: "#F5F7F5",
          secondary: "#929B96",
          muted: "#66716B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
