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
        primary: '#4263EB',    // メインカラー（青）
        accent1: '#00B8A9',    // アクセントカラー（緑）
        accent2: '#F6416C',    // アクセントカラー（紫）
        dark: '#1E293B',       // ダークカラー
        light: '#F8FAFC',      // ライトカラー
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
        heading: ['Noto Sans JP', 'sans-serif'],
        code: ['Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
      },
    },
  },
  plugins: [],
}; 