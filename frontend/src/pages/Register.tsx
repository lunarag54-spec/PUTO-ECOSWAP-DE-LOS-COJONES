import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { AxiosError } from 'axios';

const registerSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(40, 'El nombre de usuario es demasiado largo'),
  email: z.string()
    .trim()
    .email('Correo electrónico inválido')
    .min(1, 'El correo es obligatorio'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)')
    .max(100, 'La contraseña es demasiado larga'),
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: RegisterForm) => {
    setSubmitError(null);
    try {
      const response = await api.post('/api/auth/register', data);
      login(response.data.token, { 
        username: response.data.username, 
        role: response.data.role 
      });
      showToast('¡Cuenta creada con éxito!', 'success');
      navigate('/');
    } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        const message = err.response?.data?.message ||
          (err.response?.status === 400 ? 'El usuario o correo ya existen' : 'Error al registrarse');
        setSubmitError(message);
        showToast(message, 'error');
      }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-12 relative"
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2071')" }}>
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Crear Cuenta</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-center text-sm font-medium">
              {submitError}
            </div>
          )}
          <div>
            <input {...register('username')} placeholder="Nombre de usuario *" 
                   className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <input {...register('email')} type="email" placeholder="Correo electrónico *" 
                   className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input {...register('password')} type="password" placeholder="Contraseña *" 
                   className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-4 rounded-3xl text-xl font-semibold hover:bg-green-700 disabled:opacity-70 transition">
            {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-green-600 hover:underline font-medium">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;