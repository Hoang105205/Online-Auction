import flowbiteReact from "flowbite-react/plugin/tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    ".flowbite-react\\class-list.json",
  ],
  theme: {
    extend: {
      animation: {
        "pulse-border": "pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-border": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 0 rgba(250, 204, 21, 0.7), 0 10px 15px -3px rgba(250, 204, 21, 0.3)",
          },
          "50%": {
            boxShadow:
              "0 0 0 8px rgba(250, 204, 21, 0), 0 20px 25px -5px rgba(250, 204, 21, 0.2)",
          },
        },
      },
    },
  },
  plugins: [flowbiteReact],
};
