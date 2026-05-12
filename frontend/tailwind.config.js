/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f9f9fb',
          100: '#f2f2f5',
          200: '#e5e5eb',
          300: '#d1d1db',
          400: '#9b9bae',
          500: '#1a1a1e',
          600: '#141417',
          700: '#0f0f12',
          800: '#0a0a0c',
          900: '#050506',
          950: '#000000',
        },
        slate: {
          50: '#fbfbfc',
          100: '#f5f5f7',
          200: '#eeeeef',
          300: '#e2e2e5',
          400: '#a3a3ac',
          500: '#73737d',
          600: '#54545c',
          700: '#404047',
          800: '#28282c',
          900: '#19191b',
          950: '#0a0a0b',
        },
        success: {
          light: '#f5f5f7',
          DEFAULT: '#1a1a1e',
          dark: '#000000',
        },
        warning: {
          light: '#f5f5f7',
          DEFAULT: '#1a1a1e',
          dark: '#000000',
        },
        error: {
          light: '#f5f5f7',
          DEFAULT: '#1a1a1e',
          dark: '#000000',
        },
        info: {
          light: '#f5f5f7',
          DEFAULT: '#1a1a1e',
          dark: '#000000',
        },
        background: {
          DEFAULT: '#ffffff',
          subtle: '#fbfbfc',
          muted: '#f5f5f7',
        },
        surface: {
          DEFAULT: '#ffffff',
          alt: '#fbfbfc',
          border: '#eeeeef',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 12px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
        'premium-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'glow': '0 0 20px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '20px',
        '3xl': '32px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}



