module.exports = {
  content: [
    // Patrón ajustado: Busca archivos JS/TS/JSX/TSX en la raíz del proyecto y subcarpetas,
    // asumiendo que no hay carpeta 'src'.
    './**/*.{js,jsx,ts,tsx}',
    // Exclusión crucial para rendimiento, si se requiere:
    '!./node_modules/**',
  ],
  // ... resto de la configuración
};
