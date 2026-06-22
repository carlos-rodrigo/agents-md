/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './skills/html-report-designer/resources/*-template.html',
    './skills/html-report-designer/resources/*.tailwind.css',
    './skills/system-diagram/resources/*-template.html',
    './skills/system-diagram/resources/*.tailwind.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Geist Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: {
        'docs-reveal': 'cubic-bezier(.2, .8, .2, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
