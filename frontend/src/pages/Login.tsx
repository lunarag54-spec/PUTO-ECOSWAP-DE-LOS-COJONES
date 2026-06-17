import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'El nombre de usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: LoginForm) => {
    setSubmitError(null);
    try {
      const response = await api.post('/api/auth/login', data);
      
      console.log('🔍 Respuesta del login:', response.data);   
      console.log('🔍 Role recibido:', response.data.role);

      login(response.data.token, { 
        username: response.data.username, 
        role: response.data.role 
      });

      showToast('¡Inicio de sesión exitoso!', 'success');

      
      if (response.data.role === 'ADMIN' || response.data.role === 'ROLE_ADMIN') {
        console.log('→ Redirigiendo a /admin (ADMIN detectado)');
        navigate('/admin', { replace: true });
      } else {
        console.log('→ Redirigiendo a página normal');
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      const message = error.response?.status === 401 
        ? 'Usuario o contraseña incorrectos' 
        : 'Error al iniciar sesión';
      setSubmitError(message);
      showToast(message, 'error');
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-12 relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2071')" }}
    >
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Iniciar Sesión</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-center text-sm font-medium">
              {submitError}
            </div>
          )}
          <div>
            <input {...register('username')} placeholder="Nombre de usuario *" className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <input {...register('password')} type="password" placeholder="Contraseña *" className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-4 rounded-3xl text-xl font-semibold hover:bg-green-700 disabled:opacity-70">
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-green-600 hover:underline font-medium">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;