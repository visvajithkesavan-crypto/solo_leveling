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
      },
      fontFamily: {
        'system': ['monospace', 'Courier New'],
      },
    },
  },
  plugins: [],
}
