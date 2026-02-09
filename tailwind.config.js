/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* Explicit breakpoints for mobile / tablet / desktop (see DESIGN_RULES.md). */
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
      },
      maxWidth: {
        container: "1200px",
        "container-narrow": "720px",
      },
    },
  },
  plugins: [],
};
