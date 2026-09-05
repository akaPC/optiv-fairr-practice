/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F14',
        panel: '#121821',
        panel2: '#18202B',
        line: '#1F2A37',
        line2: '#2A3644',
        cyan: '#22D3EE',
        amber: '#F59E0B',
        red: '#EF4444',
        slate: { DEFAULT: '#94A3B8', dim: '#64748B', bright: '#CBD5E1' },
        paper: '#E6EDF3',
      },
      fontFamily: {
        head: ['"Barlow Condensed"', '"Arial Narrow"', 'Impact', 'sans-serif'],
        body: ['"IBM Plex Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', '1rem'],
      },
    },
  },
  plugins: [],
};
