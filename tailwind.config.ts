import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // ESTA LÍNEA ES LA QUE ARREGLA TU WEB
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bntOrange: "#ff5f00",
      },
    },
  },
  plugins: [],
};
export default config;