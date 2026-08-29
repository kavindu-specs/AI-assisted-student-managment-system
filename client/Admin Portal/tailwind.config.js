export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#7A1F2B',
          light: '#8f2734',
          dark: '#5f1621',
          900: '#4a111a',
          950: '#3a0d15',
        },
        gold: {
          DEFAULT: '#F2C94C',
          light: '#f6d874',
          dark: '#d9b23a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
