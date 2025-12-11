import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // 1. Configuraciones globales
  {
    // Ignora los directorios que no queremos analizar.
    // Esto reemplaza a los archivos .eslintignore
    ignores: ['dist/', 'functions/lib/', 'functions/node_modules/', 'node_modules/', 'coverage/'],
  },

  // 2. Configuración para archivos de configuración en la raíz (ej. vite.config.ts)
  {
    files: ['*.ts', '*.js'], // Incluye archivos .ts y .js en la raíz
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // Usa el tsconfig.json de la raíz
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node, // Estos son archivos de entorno Node.js
      },
    },
  },

  // 3. Configuración para el Frontend (React/Vite en la raíz del proyecto)
  {
    extends: [...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // Apunta al tsconfig.json del frontend
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser },
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules, // Para el nuevo JSX transform de React
    },
    settings: {
      react: {
        version: 'detect', // Detecta automáticamente la versión de React
      },
    },
  },

  // 4. Configuración para el Backend (Firebase Functions)
  {
    extends: [...tseslint.configs.recommended],
    files: ['functions/src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './functions/tsconfig.json', // Apunta al tsconfig.json del backend
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node },
    },
    // Nota: No se aplican reglas de React aquí.
  },

  // 5. Configuración de Prettier (debe ser la última para anular reglas de estilo)
  prettierConfig
);
