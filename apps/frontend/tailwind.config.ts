import type { Config } from "tailwindcss"

import { heroui } from "@heroui/react";

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    heroui(),
  ],
} satisfies Config

export default config