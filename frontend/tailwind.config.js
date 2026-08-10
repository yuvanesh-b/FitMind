/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          dark: 'var(--bg-main)',
          light: 'var(--bg-main)',
          main: 'var(--bg-main)',
        },
        surface: {
          dark: 'var(--bg-card)',
          elevated: 'var(--bg-surface)',
          border: 'var(--border-subtle)',
          card: 'var(--bg-card)',
          secondary: 'var(--bg-surface)',
        },
        brand: {
          50: '#F8F2FA',
          100: '#EFE5F5',
          300: '#C7B6DC',
          400: '#9C8BB2', // SECONDARY MUTED PURPLE (#9C8BB2)
          500: '#865BC4', // PRIMARY PURPLE (#865BC4)
          600: 'var(--brand-hover)',
          700: '#623999',
          violet: '#865BC4',
          purple: '#9C8BB2',
          glow: 'var(--brand-glow)',
        },
        accent: {
          emerald: '#059669',
          amber: '#D97706',
          rose: '#E11D48',
          cyan: '#865BC4',
          violet: '#865BC4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
