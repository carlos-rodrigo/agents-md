/** @type {import('tailwindcss').Config} */
module.exports = {
  // Report classes are authored in the source CSS. Avoid scanning generated
  // inline CSS, which would make obsolete utility classes self-perpetuating.
  content: [{ raw: '<main></main>', extension: 'html' }],
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
  plugins: [],
};
