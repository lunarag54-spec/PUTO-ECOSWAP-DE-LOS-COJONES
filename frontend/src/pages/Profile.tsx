import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { API_URL } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)')
});

type PasswordForm = z.infer<typeof passwordSchema>;

interface UserProfile {
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface Review {
  id: number;
  reviewer?: {
    username: string;
    avatarUrl?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const Profile = () => {
  const { showToast } = useToast();
  const { profileUsername } = useParams<{ profileUsername?: string }>();
  const { user: currentUser } = useAuth();

  const isOwnProfile = !profileUsername || (currentUser && currentUser.username === profileUsername);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'reviews'>('info');
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { register: regPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passErrors, isSubmitting: isPassSubmitting }, reset: resetPassword } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur'
  });

  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const endpoint = isOwnProfile ? '/api/users/profile' : `/api/users/profile/${profileUsername}`;
        const res = await api.get(endpoint);
        const user = res.data;
        setProfile(user);
        setBio(user.bio || '');
        setPhone(user.phone || '');
        setAddress(user.address || '');
        setCity(user.city || '');
        setPostalCode(user.postalCode || '');

        // Fetch user reviews
        const revsRes = await api.get(`/api/reviews/seller/${user.username}`);
        setReviews(revsRes.data);

        // Fetch average rating
        const avgRes = await api.get(`/api/reviews/average/${user.username}`);
        setAvgRating(avgRes.data.average || 0);
      } catch (err) {
        console.error(err);
        showToast('Error al cargar la información del perfil', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileUsername, isOwnProfile, showToast]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append('image', avatarFile);

    try {
      const res = await api.post('/api/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Imagen de perfil actualizada', 'success');
      if (profile) {
        setProfile({ ...profile, avatarUrl: res.data.avatarUrl });
      }
      setAvatarFile(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al subir el avatar';
      showToast(msg, 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/api/users/profile', { bio, phone, address, city, postalCode });
      setProfile(res.data);
      showToast('Perfil actualizado correctamente', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await api.put('/api/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      showToast('Contraseña cambiada con éxito', 'success');
      resetPassword();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al cambiar la contraseña';
      showToast(msg, 'error');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-light dark:bg-gray-900">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="relative group">
            <img
              src={avatarPreview || (profile?.avatarUrl ? `${API_URL}${profile.avatarUrl}` : 'https://picsum.photos/id/1025/150/150')}
              alt="Avatar"
              className="w-32 h-32 object-cover rounded-full border-4 border-primary shadow"
            />
            {isOwnProfile && (
              <label className="absolute inset-0 bg-black/50 hover:bg-black/60 text-white text-xs font-semibold flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
                Cambiar Foto
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-dark dark:text-white">{profile?.username}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{profile?.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-yellow-500">
              <span className="text-xl">⭐</span>
              <span className="font-semibold text-lg">{avgRating > 0 ? avgRating.toFixed(1) : 'Sin valoraciones'}</span>
              <span className="text-gray-400">({reviews.length} reseñas)</span>
            </div>
            {isOwnProfile && avatarFile && (
              <button 
                onClick={uploadAvatar}
                className="mt-4 px-4 py-2 bg-primary hover:bg-green-600 text-white text-sm font-semibold rounded-2xl transition"
              >
                Guardar Nueva Foto
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-8">
          <button 
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-semibold rounded-t-2xl transition ${activeTab === 'info' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
          >
            {isOwnProfile ? 'Datos Personales' : 'Información'}
          </button>
          {isOwnProfile && (
            <button 
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 font-semibold rounded-t-2xl transition ${activeTab === 'security' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
            >
              Seguridad
            </button>
          )}
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-semibold rounded-t-2xl transition ${activeTab === 'reviews' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
          >
            {isOwnProfile ? 'Mis Reseñas' : 'Valoraciones'} ({reviews.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md">
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Sobre mí (Biografía)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={isOwnProfile ? "Cuéntales a otros coleccionistas un poco sobre ti..." : "Este usuario no tiene biografía."}
                  readOnly={!isOwnProfile}
                  disabled={!isOwnProfile}
                  className="w-full p-4 border rounded-3xl h-24 focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 disabled:opacity-85"
                />
              </div>

              {isOwnProfile ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Teléfono de contacto</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej: 600123456"
                        className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Dirección de entrega</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Calle, número, piso..."
                        className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ciudad</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Madrid"
                        className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Código Postal</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="28001"
                        className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-primary hover:bg-green-600 text-white py-4 rounded-3xl font-semibold transition"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </>
              ) : (
                city && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Ubicación (Ciudad)</label>
                    <input
                      type="text"
                      value={city}
                      readOnly
                      disabled
                      className="w-full p-4 border rounded-3xl bg-gray-50 focus:outline-none dark:bg-gray-700 dark:border-gray-600 disabled:opacity-85"
                    />
                  </div>
                )
              )}
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña Actual</label>
                <input
                  type="password"
                  {...regPassword('currentPassword')}
                  className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                />
                {passErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passErrors.currentPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  {...regPassword('newPassword')}
                  className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                />
                {passErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passErrors.newPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isPassSubmitting}
                className="w-full bg-primary hover:bg-green-600 text-white py-4 rounded-3xl font-semibold transition"
              >
                {isPassSubmitting ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-center text-gray-500 py-6">Todavía no has recibido ninguna reseña.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">@{rev.reviewer?.username || 'Usuario'}</span>
                      <span className="text-yellow-500">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{rev.comment}</p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
