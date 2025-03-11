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
        sans: ['var(--font-noto-sans-jp)', 'sans-serif'],
        mono: ['var(--font-source-code-pro)', 'monospace'],
        display: ['var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent1: '#00B8A9',    // アクセントカラー（緑）
        accent2: '#F6416C',    // アクセントカラー（紫）
        dark: '#1A202C',       // ダークカラー
        light: '#F8FAFC',      // ライトカラー
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}; 