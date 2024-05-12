// tailwind.config.js

// Import type definitions for Tailwind CSS Config
import type { Config } from "tailwindcss";

// Define the configuration as per Tailwind's required structure
const config: Config = {
  // Enable dark mode using the 'class' strategy, where you control the dark mode by adding a 'dark' class to your root element
  darkMode: "class",

  // Include content paths where Tailwind should apply its styles. It's crucial to cover all file types where you might use Tailwind classes.
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // Define the theme settings, including both custom and extended utilities and components
  theme: {
    // Define responsive breakpoints and container settings
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    // Extend the default theme with additional colors, animations, fonts, and other utilities
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E43030",
          orange: "#D48D3B",
          green: "#3E9242",
        },
        secondary: "#282828",
        "gray-200": "#EAECF0",
        "gray-300": "D0D5DD",
        "gray-500": "#667085",
        "gray-600": "#475467",
        "gray-700": "#344054",
        "gray-900": "#101828",
        "white-100": "#F4F4F4",
        "white-200": "#EDF0F8",
        "black-100": "#3D4258",
        "neutral-black": "#23263B",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        spaceGrotesk: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        xs: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
      },
      maxWidth: {
        "10xl": "1440px",
      },
      borderRadius: {
        10: "10px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  // Optionally include any Tailwind plugins you are using
  plugins: [
    require("tailwindcss-animate"), // Ensure this plugin is properly installed and compatible with your version of Tailwind
  ],
};

// Export the configuration object
export default config;
