/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif']
      },
      colors: {
        command: {
          bg: '#05070d',
          panel: '#0d1420',
          line: '#1f2a3a',
          ok: '#3ddc97',
          warn: '#f7b955',
          danger: '#ff5e5b',
          accent: '#4cc9f0'
        }
      },
      boxShadow: {
        panel: '0 18px 45px rgba(0, 0, 0, 0.45)'
      },
      keyframes: {
        pulseCritical: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 94, 91, 0.6)' },
          '70%': { boxShadow: '0 0 0 18px rgba(255, 94, 91, 0)' }
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        critical: 'pulseCritical 1.8s infinite',
        riseIn: 'riseIn 420ms ease-out both'
      }
    }
  },
  plugins: []
};
