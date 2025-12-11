// old path: src/services/LoginScreen.tsx
// new path: src/screens/auth/LoginScreen.tsx
// Comentario: Este componente es una pantalla, por lo que se ha movido de 'services' a 'screens/auth'.
// También se ha actualizado para usar el nuevo 'userService'.

import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Input from '@/components/ui/Input'; // Importar componente Input
import Button from '@/components/ui/Button'; // Importar componente Button
import { userService } from '@/services/userService';

// Este componente ahora maneja la autenticación directamente con Firebase
// para evitar el conflicto de tipos con el hook `useFirebaseAuth`.
const LoginScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mapa para traducir códigos de error de Firebase a mensajes amigables.
  const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
    'auth/invalid-credential': 'El correo electrónico o la contraseña son incorrectos.',
    'auth/wrong-password': 'El correo electrónico o la contraseña son incorrectos.',
    'auth/user-not-found': 'El correo electrónico o la contraseña son incorrectos.',
    'auth/invalid-email': 'El formato del correo electrónico no es válido.',
    'auth/too-many-requests': 'El acceso a esta cuenta ha sido deshabilitado temporalmente debido a demasiados intentos fallidos.',
    'auth/network-request-failed': 'Error de red. Por favor, comprueba tu conexión a internet.',
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado. Intenta iniciar sesión.',
    'auth/weak-password': 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.',
  };

  const getFirebaseErrorMessage = (errorCode: string, isLogin: boolean) => {
    const defaultMessage = isLogin
      ? 'Ocurrió un error inesperado al intentar iniciar sesión.'
      : 'Ocurrió un error inesperado al registrarse.';
    return FIREBASE_ERROR_MESSAGES[errorCode] || defaultMessage;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const auth = getAuth();

    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
        // El componente App se encargará de redirigir al detectar la sesión.
      } else {
        // Lógica de registro
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        if (!name.trim()) {
          throw new Error('El nombre es obligatorio.');
        }

        // 1. Registrar el usuario en Firebase Authentication.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 2. Si el usuario se crea correctamente, guardar sus datos iniciales en Firestore.
        if (userCredential.user) {
          // Nota: Si TypeScript sigue mostrando un error en la línea de 'preferences',
          // es probable que se deba a una caché de tipos desactualizada en tu entorno de desarrollo.
          // Las definiciones en `user.ts` y `auth.ts` son correctas. Reiniciar el servidor de TS
          // o el editor de código suele solucionar este problema.
          await userService.createUser(userCredential.user.uid, email, { // Corregido: Se eliminó `preferences` de la creación inicial del usuario.
            name: name,
            role: 'user', // Añadido: Asignar el rol 'user' por defecto al crear la cuenta.
          }); // Las preferencias y otros detalles del perfil se deben gestionar en otra parte de la aplicación, no en el registro.
        }
        // 3. El componente App.tsx detectará la nueva sesión y redirigirá
        //    automáticamente a la pantalla principal.
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        setError(getFirebaseErrorMessage(err.code as string, isLoginView));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        const defaultMessage = isLoginView
          ? 'Error al iniciar sesión. Revisa tus credenciales.'
          : 'Error al registrarse. Inténtalo de nuevo.';
        setError(defaultMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginView && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre Completo"
              required
            />
          )}
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />
          {!isLoginView && (
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              required
            />
          )}
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <Button type="submit" isLoading={loading} fullWidth>
            {isLoginView ? 'Entrar' : 'Registrarse'}
          </Button>
        </form>
        <p className="text-sm text-center text-gray-600">
          {isLoginView ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          <button onClick={toggleView} className="ml-1 font-semibold text-blue-600 hover:underline">
            {isLoginView ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
