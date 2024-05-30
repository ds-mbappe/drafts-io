import type { Config } from "tailwindcss"

import { nextui } from "@nextui-org/react";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: ['ProseMirror'],
  prefix: "",
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    nextui(),
  ],
} satisfies Config

export default config