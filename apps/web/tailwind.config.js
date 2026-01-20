/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'system-bg': '#0a0e27',
        'system-panel': '#111827',
        'system-border': '#2563eb',
        'system-text': '#e5e7eb',
        'system-gold': '#fbbf24',
        'system-mana': '#3b82f6',
        'slate-850': '#172033',
      },
      fontFamily: {
        'system': ['monospace', 'Courier New'],
        'rajdhani': ['var(--font-rajdhani)', 'Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'quest': '0 0 20px rgba(34, 211, 238, 0.25), 0 4px 16px rgba(0, 0, 0, 0.5)',
        'quest-hover': '0 0 35px rgba(34, 211, 238, 0.45), 0 8px 24px rgba(0, 0, 0, 0.6)',
        'status': '0 0 40px rgba(34, 211, 238, 0.3), 0 10px 40px rgba(0, 0, 0, 0.5)',
        'level-up': '0 0 80px rgba(34, 211, 238, 0.6), 0 0 150px rgba(34, 211, 238, 0.3)',
        'button-cyan': '0 0 15px rgba(34, 211, 238, 0.4), inset 0 0 15px rgba(34, 211, 238, 0.1)',
        'button-red': '0 0 15px rgba(248, 113, 113, 0.4), inset 0 0 15px rgba(248, 113, 113, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
