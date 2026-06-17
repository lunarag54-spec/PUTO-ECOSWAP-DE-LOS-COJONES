import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../context/ToastContext';

const deliverySchema = z.object({
  fullName: z.string().trim().min(3, 'El nombre completo es obligatorio'),
  address: z.string().trim().min(5, 'La dirección es obligatoria'),
  city: z.string().trim().min(2, 'La ciudad es obligatoria'),
  postalCode: z.string().trim().regex(/^\d{5}$/, 'El código postal debe tener exactamente 5 dígitos numéricos'),
  phone: z.string().trim().optional().or(z.literal('')).refine(val => !val || /^\d{9,15}$/.test(val), 'El teléfono debe tener entre 9 y 15 dígitos numéricos'),
});

type DeliveryForm = z.infer<typeof deliverySchema>;

const DatosEntrega = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();
  const paymentMethod = location.state?.paymentMethod || 'efectivo';

  console.log('📍 DatosEntrega cargada - Método recibido:', paymentMethod);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DeliveryForm>({
    resolver: zodResolver(deliverySchema),
    mode: 'onBlur'
  });

  const onSubmit = (data: DeliveryForm) => {
    console.log('✅ Formulario enviado - Método:', paymentMethod, data);

    showToast('Datos de entrega guardados', 'success');

    if (paymentMethod === 'efectivo') {
      navigate('/pedido-finalizado', { 
        replace: true, 
        state: { paymentMethod: 'EFECTIVO', deliveryData: data } 
      });
    } else {
      navigate('/pago', { 
        replace: true, 
        state: { paymentMethod: 'TARJETA', deliveryData: data } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-12 relative"
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2071')" }}>
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Datos de Entrega</h1>
        <p className="text-center text-gray-600 mb-8">Dónde quieres recibir tu pedido</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input {...register('fullName')} placeholder="Nombre completo *" className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <input {...register('address')} placeholder="Dirección completa *" className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input {...register('city')} placeholder="Ciudad *" className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <input {...register('postalCode')} placeholder="Código Postal *" className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
              {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
            </div>
          </div>

          <div>
            <input {...register('phone')} type="tel" placeholder="Teléfono de contacto (opcional)" className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-5 rounded-3xl text-xl font-semibold hover:bg-green-700 disabled:opacity-70 transition">
            {isSubmitting ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DatosEntrega;