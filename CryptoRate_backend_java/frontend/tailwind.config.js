/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crypto: {
          bg: '#0a0a0a',
          'bg-light': '#1a1a1a',
          'bg-card': '#0f0f0f',
        },
        gold: {
          400: '#FFD700',
          500: '#FFC700',
        },
        btc: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CCB300',
        },
        eth: {
          DEFAULT: '#A0AEC0',
          light: '#CBD5E0',
          dark: '#718096',
        },
        bnb: {
          DEFAULT: '#F3BA2F',
          light: '#F5C754',
          dark: '#C99E26',
        }
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'outfit': ['Outfit', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.2)',
        'glow-lg': '0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
