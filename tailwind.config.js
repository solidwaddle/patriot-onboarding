/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#16245c', 600: '#1b2a6b', 700: '#16245c', 800: '#101b45', 900: '#0b1331' },
        patriotred: { DEFAULT: '#c8202e', 600: '#c8202e', 700: '#a81825' },
        ink: '#1f2433',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 3px rgba(16,27,69,0.08), 0 10px 40px -12px rgba(16,27,69,0.18)',
      },
    },
  },
  plugins: [],
}
