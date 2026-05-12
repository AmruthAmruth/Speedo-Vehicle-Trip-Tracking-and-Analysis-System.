/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#a1b6fb',
          400: '#6d8bf7',
          500: '#435cf0', // Primary Brand
          600: '#2e3ed1',
          700: '#242ea9',
          800: '#212889',
          900: '#1f2571',
          950: '#131643',
        },
        
        // Neutral Colors
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },

        // Semantic Colors
        success: {
          light: '#dcfce7',
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
        warning: {
          light: '#fef9c3',
          DEFAULT: '#eab308',
          dark: '#ca8a04',
        },
        error: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        info: {
          light: '#e0f2fe',
          DEFAULT: '#0ea5e9',
          dark: '#0284c7',
        },

        // Surface & Backgrounds
        background: {
          DEFAULT: '#ffffff',
          subtle: '#f8fafc',
          muted: '#f1f5f9',
        },
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f8fafc',
          border: '#e2e8f0',
        },
        
        // Legacy Support (Keeping existing names if they were used)
        primary: {
          DEFAULT: '#435cf0',
          dark: '#2e3ed1',
          light: '#6d8bf7',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 8px 15px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 15px rgba(67, 92, 240, 0.3)',
      },

      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}

