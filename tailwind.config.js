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
        creative: ['Georgia', 'Cambria', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',    // Warm coral red - creative and energetic
          dark: '#E55555',       // Darker shade for hover states
        },
        secondary: '#4ECDC4',  // Turquoise - fresh and artistic
        accent1: '#FFE66D',    // Warm yellow - playful and creative
        accent2: '#A8E6CF',    // Soft mint green - gentle creative touch
        dark: '#2D3436',       // Soft black - less harsh
        light: '#FAFAFA',      // Slightly warmer white
        purple: '#C7A6FF',     // Soft purple for creative accents
        orange: '#FFA502',     // Vibrant orange for highlights
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