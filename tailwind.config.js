/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Hiragino Kaku Gothic ProN"', '"游ゴシック体"', '"Yu Gothic"', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', '"Zen Old Mincho"', 'serif'],
        mincho: ['"Zen Old Mincho"', '"Shippori Mincho"', 'YuMincho', '"Hiragino Mincho ProN"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-mute': 'var(--ink-mute)',
        rule: 'var(--rule)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/line-clamp')],
};
