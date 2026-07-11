import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#2563eb",
          50: "#eff6ff",
          100: "#dbeafe",
          600: "#2563eb",
          700: "#1d4ed8"
        },
        surface: {
          1: "#ffffff",
          2: "#f8fafc",
          3: "#f1f5f9"
        },
        ink: {
          900: "#0f172a",
          700: "#334155",
          500: "#64748b",
          300: "#cbd5e1"
        },
        sidebar: {
          DEFAULT: "#0f172a",
          hover: "#1e293b"
        },
        good: { DEFAULT: "#16a34a", bg: "#f0fdf4" },
        warn: { DEFAULT: "#d97706", bg: "#fffbeb" },
        bad: { DEFAULT: "#dc2626", bg: "#fef2f2" }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
