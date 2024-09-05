/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        'dawn-pink': {
          50: '#faf7f6',
          100: '#f2e9e4',
          200: '#eee1da',
          300: '#e1ccc0',
          400: '#cead9b',
          500: '#ba9079',
          600: '#a3775f',
          700: '#88624d',
          800: '#725342',
          900: '#60493c',
          950: '#33241c'
        },
      }
    },
  },
  plugins: [
    require("@midudev/tailwind-animations"),
  ],
}

