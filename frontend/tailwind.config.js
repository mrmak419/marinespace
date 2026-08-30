/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#0284c7',
        background: '#ffffff',
        foreground: '#0f172a',
        primary: {
          DEFAULT: '#0284c7',
          foreground: '#f0f9ff',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#1e293b',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#1e293b',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#f0f9ff',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#ef4444',
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}
