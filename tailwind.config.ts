import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#171717',
          700: '#3f3f46',
          500: '#71717a',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
