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
        border: "#e5e7eb",
        muted: "#6b7280",
        accent: "#2563eb",
        bg: "#f8fafc"
      }
    }
  },
  plugins: []
};

export default config;
