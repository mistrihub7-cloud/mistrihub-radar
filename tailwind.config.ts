import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#0f5cff",
          600: "#0a4be0",
          700: "#073bb5"
        },
        ink: "#071225"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(15, 52, 96, 0.08)",
        card: "0 8px 26px rgba(15, 52, 96, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
