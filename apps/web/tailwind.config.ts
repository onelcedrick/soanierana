import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-primary-light)',
          100: 'var(--color-primary-light)',
          500: 'var(--color-primary-hover)',
          600: 'var(--color-primary)',       // <-- Utilise la variable CSS
          900: 'var(--color-primary-dark)',  // <-- Utilise la variable CSS
        },
        surface: 'var(--color-surface)',
        background: 'var(--color-background)',
        mainText: 'var(--color-text)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
