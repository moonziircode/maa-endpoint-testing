/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        anteraja: {
          pink: "#E31E52",
          dark: "#B8133E",
          light: "#FDF2F4",
          purple: "#7A1C79",
          gray: "#F4F6F9"
        }
      }
    },
  },
  plugins: [],
}