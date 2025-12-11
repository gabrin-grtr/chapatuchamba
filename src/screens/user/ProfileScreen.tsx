// old path: src/screens/student/ProfileScreen.tsx
// new path: src/screens/user/ProfileScreen.tsx
// Comentario: El archivo ha sido movido a la nueva carpeta 'user'.
// Se ha actualizado para usar 'userService' en lugar de 'jobStorageService'.

import React, { useState, useEffect } from 'react';
import {
  // Icons
  Mail,
  Phone,
  MapPin,
  Save,
  LogOut,
  Plus,
  X,
  Camera,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext'; // Para obtener el usuario actual
import { userService } from '@/services/userService'; // Para interactuar con la BD
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type {
  UserProfile,
  JobSearchPreferences,
  NotificationPreferences,
} from '@/types';

interface ProfileScreenProps {
  onLogout?: () => void;
  onboardingMode?: boolean;
  onProfileComplete?: () => void;
}

// Define estados por defecto para las preferencias en caso de que un usuario aún no las tenga.
const defaultJobPrefs: JobSearchPreferences = { keywords: [], locations: [], minSalary: 0 };
const defaultNotifPrefs: NotificationPreferences = {
  inApp: true,
  email: true,
  frequency: 'daily',
  format: 'summary',
  maxJobs: 5,
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onboardingMode = false,
  onProfileComplete,
}) => {
  const { user } = useAuth(); // Obtener el usuario de nuestro contexto de autenticación
  const [isEditing, setIsEditing] = useState(onboardingMode);
  const [activeTab, setActiveTab] = useState<'personal' | 'skills'>('personal');

  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [skills, setSkills] = useState<{ id: number; name: string; level: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        const userProfile = await userService.getUserProfile(user.uid);
        if (userProfile) {
          setProfile({
            ...userProfile,
            // Asegura que los objetos de preferencias existan para evitar errores en el formulario.
            jobPreferences: userProfile.jobPreferences || defaultJobPrefs,
            notificationPreferences: userProfile.notificationPreferences || defaultNotifPrefs,
          });
          // Carga las habilidades desde el perfil del usuario.
          // Se añade un ID temporal para que React pueda manejar la lista.
          const loadedSkills = (userProfile.skills || []).map((skillName, index) => ({
            id: index,
            name: skillName,
            level: 'Intermedio', // El nivel no se guarda, se puede mejorar en el futuro.
          }));
          setSkills(loadedSkills);
        } else if (user?.email) {
          // Fallback para un nuevo usuario que aún no tiene perfil en la DB
          setProfile({
            email: user.email,
            jobPreferences: defaultJobPrefs,
            notificationPreferences: defaultNotifPrefs,
          });
        }
      }
    };
    void fetchProfile();
  }, [user]);

  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermedio');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setSkills([
        ...skills,
        {
          id: Date.now(),
          name: newSkill,
          level: newSkillLevel,
        },
      ]);
      setNewSkill('');
      setNewSkillLevel('Intermedio');
    }
  };

  const handleRemoveSkill = (id: number) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  const handleSaveProfile = async () => {
    if (!user?.uid || !profile) {
      setMessage('Error: No se ha podido identificar al usuario.');
      setSaving(false);
      return;
    }
    setSaving(true);
    setMessage(null);

    if (
      onboardingMode &&
      (!profile.firstName ||
        !profile.phone ||
        !profile.location ||
        !profile.age
      )
    ) {
      setMessage('Por favor, completa todos los campos obligatorios para continuar.');
      setSaving(false);
      return;
    }

    try {
      const profileData: Partial<UserProfile> = {
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        location: profile.location,
        age: Number(profile.age) || undefined,
        headline: profile.headline,
        skills: skills.map((s) => s.name),
      };

      // Llama a un único método para una escritura eficiente en la base de datos,
      // consolidando todas las actualizaciones del perfil en una sola operación.
      await userService.saveUserProfile(user.uid, profileData);

      setMessage('Perfil guardado correctamente');
      if (onboardingMode && onProfileComplete) {
        onProfileComplete();
      } else {
        setIsEditing(false);
      }
      setTimeout(() => setMessage(null), 2500);
    } catch (e) {
      console.error('Error saving profile', e);
      setMessage('Error guardando el perfil');
    } finally {
      setSaving(false);
    }
  };

  const renderPersonalInformationForm = () => (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <Input
            type="text"
            value={profile.firstName || ''}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <Input
            type="text"
            value={profile.lastName || ''}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (no se puede cambiar)
          </label>
          <Input type="email" value={profile.email || ''} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <Input
            type="tel"
            value={profile.phone || ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">País de Residencia</label>
          <Input
            type="text"
            value={profile.location || ''}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
          <Input
            type="number"
            value={profile.age || ''}
            onChange={(e) => setProfile({ ...profile, age: String(e.target.value) })}
            required
          />
        </div>
      </div>

      {!onboardingMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción Personal
          </label>
          <textarea
            value={profile.headline || ''}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes('Error') || message.includes('completa')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSaveProfile} isLoading={saving} fullWidth>
          <Save size={18} />
          {onboardingMode ? 'Guardar y Continuar' : 'Guardar Cambios'}
        </Button>
        {!onboardingMode && (
          <Button onClick={() => setIsEditing(false)} variant="secondary">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );

  if (onboardingMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Completa tu Perfil</h1>
              <p className="text-gray-600 mt-2">
                Necesitamos algunos datos más para personalizar tu experiencia.
              </p>
            </div>
            {renderPersonalInformationForm()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.firstName || 'user'}`}
                alt="Foto de perfil"
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full shadow-lg hover:bg-gray-100">
                  <Camera size={16} />
                </button>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Usuario'}
              </h1>
              <p className="opacity-90">{profile.headline}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Información Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard icon={<Mail size={20} />} label="Email" value={profile.email || '-'} />
        <InfoCard icon={<Phone size={20} />} label="Teléfono" value={profile.phone || '-'} />
        <InfoCard icon={<MapPin size={20} />} label="Ubicación" value={profile.location || '-'} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {[
            { id: 'personal', label: '👤 Información Personal' },
            { id: 'skills', label: '💡 Habilidades' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'personal' | 'skills')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de Tabs */}
      {activeTab === 'personal' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Información Personal</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar
              </button>
            )}
          </div>

          {isEditing ? (
            renderPersonalInformationForm()
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Nombre Completo</p>
                <p className="text-lg font-medium text-gray-900">
                  {`${profile.firstName || ''} ${profile.lastName || ''}`.trim()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium text-gray-900">{profile.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="text-lg font-medium text-gray-900">{profile.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">País de Residencia</p>
                <p className="text-lg font-medium text-gray-900">{profile.location || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Edad</p>
                <p className="text-lg font-medium text-gray-900">{profile.age || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Descripción</p>
                <p className="text-gray-900">{profile.headline || '-'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Habilidades Profesionales</h2>

          {/* Skills List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
              >
                <div>
                  <p className="font-semibold text-gray-900">{skill.name}</p>
                  <p className="text-sm text-gray-600">{skill.level}</p>
                </div>
                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Agregar Nueva Habilidad */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Añadir Nueva Habilidad</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nombre de la habilidad (ej: Python, AWS)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Básico</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente para mostrar información rápida
 */
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
    <div className="text-blue-600">{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default ProfileScreen;
