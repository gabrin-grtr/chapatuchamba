import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { jobService } from '@/services/jobService';
import { UserNotification } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

const NotificationsScreen: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      const unsubscribe = jobService.listenToUserNotifications(user.uid, (newNotifications) => {
        setNotifications(newNotifications);
        setLoading(false);
      });

      // Limpiar la suscripción al desmontar
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleNotificationClick = async (notification: UserNotification) => {
    if (user?.uid && !notification.read) {
      try {
        // Marcar como leída solo si no lo está ya, para evitar escrituras innecesarias.
        await jobService.markNotificationAsRead(user.uid, notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    // TODO: Implementar navegación a la página de detalles del trabajo.
    // Por ejemplo, si tienes un router: navigate(`/jobs/${notification.jobId}`);
    console.log(`Navegando a los detalles del trabajo: ${notification.jobId}`);
  };

  const handleMarkAllAsRead = async () => {
    if (user?.uid) {
      try {
        await jobService.markAllNotificationsAsRead(user.uid);
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        {notifications.some((n) => !n.read) && (
          <Button onClick={handleMarkAllAsRead} variant="secondary">
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No tienes notificaciones.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-lg shadow-sm cursor-pointer transition-colors ${
                notif.read ? 'bg-white' : 'bg-blue-50 border-l-4 border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-800">{notif.title}</p>
                <p className="text-xs text-gray-500">{notif.createdAt.toLocaleDateString()}</p>
              </div>
              <p className="text-sm text-gray-600">en {notif.company}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;