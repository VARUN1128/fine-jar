/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--dp-color-line)",
        input: "var(--dp-color-line)",
        ring: "var(--dp-color-accent)",
        background: "var(--dp-color-ground)",
        foreground: "var(--dp-color-ink)",
        cyber: {
          ground: "#020303",
          plate: "#090e0b",
          line: "#304c3b",
          control: "#659579",
          accent: "#38ff8e",
          cyan: "#65f8ff",
          magenta: "#ff65d8",
          ink: "#f8fffa",
          body: "#d3dbd5",
          muted: "#c2cbc5",
        },
      },
      fontFamily: {
        display: ['"Cyberpunk Plex Sans"', '"IBM Plex Sans"', 'sans-serif'],
        mono: ['"Cyberpunk Plex Mono"', '"IBM Plex Mono"', 'monospace'],
        sans: ['"Cyberpunk Plex Sans"', '"IBM Plex Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
      },
    },
  },
  plugins: [],
}
