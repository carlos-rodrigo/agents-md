/** Tailwind build authority for the HTML report templates restored from ce8aab1. */
module.exports = {
  content: [
    './skills/html-report-designer/resources/*-template.html',
    './skills/html-report-designer/resources/*.tailwind.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Geist Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
