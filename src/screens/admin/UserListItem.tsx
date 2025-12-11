import React, { useState } from 'react';
import { ChevronDown, Trash2, User } from 'lucide-react';
import type { UserForAdmin } from '@/types';
import { userService } from '@/services/userService';
import Button from '@/components/ui/Button';

interface UserListItemProps {
  user: UserForAdmin;
  onUserDeleted: (userId: string) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onUserDeleted }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete user ${user.email || user.id}? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        // As per service implementation, this will throw an error.
        // In a real scenario, this would call a Cloud Function.
        await userService.deleteUserAdmin(user.id);
        onUserDeleted(user.id);
      } catch (error) {
        alert((error as Error).message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50"
      >
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-full mr-4">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user.email || 'No email provided'}</p>
            <p className="text-sm text-gray-500">Role: <span className="font-medium text-gray-700">{user.role || 'N/A'}</span></p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="font-semibold mb-2 text-gray-700">Detalles del Usuario</h4>
          <div className="text-sm space-y-2 text-gray-600">
            <p><strong>User ID:</strong> {user.id}</p>
            {user.preferences && (
              <div>
                <strong>Preferencias:</strong>
                <pre className="mt-1 p-2 bg-white rounded text-xs whitespace-pre-wrap font-mono">
                  {JSON.stringify(user.preferences, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
            <Button
              onClick={handleDelete}
              isLoading={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={16} className="mr-2" />
              Eliminar Usuario
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListItem;