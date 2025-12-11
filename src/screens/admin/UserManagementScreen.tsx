// new path: src/screens/admin/UserManagementScreen.tsx
// Comentario: Nueva pantalla para que los administradores gestionen los roles de los usuarios.

import React, { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { UserForAdmin, Role } from '@/types';
import Button from '@/components/ui/Button';

const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<UserForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null); // Guarda el ID del usuario que se está actualizando

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userList = await userService.getAllUsers();
        setUsers(userList);
      } catch (err) {
        setError('No se pudieron cargar los usuarios.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setSaving(userId);
    try {
      await userService.updateUserRole(userId, newRole);
      // Actualizar la UI localmente para reflejar el cambio
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
    } catch (err) {
      alert('Error al actualizar el rol. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Rol Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.role === 'admin' ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleRoleChange(user.id, 'user')}
                      isLoading={saving === user.id}
                    >
                      Quitar Admin
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRoleChange(user.id, 'admin')}
                      isLoading={saving === user.id}
                    >
                      Hacer Admin
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementScreen;
