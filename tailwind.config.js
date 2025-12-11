/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1E1B4B', // Azul oscuro profundo (Navy)
          light: '#EEF2FF', // Azul muy claro (Indigo 50)
          accent: '#FF9F43', // Naranja vibrante
          bg: '#F3F4F6', // Gris claro de fondo
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
