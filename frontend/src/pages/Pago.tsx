import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const paymentSchema = z.object({
  cardName: z.string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre debe contener solo letras y espacios'),
  cardNumber: z.string()
    .trim()
    .regex(/^\d{16}$/, 'El número de tarjeta debe tener exactamente 16 dígitos numéricos'),
  expirationDate: z.string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Formato de expiración inválido (MM/AA)'),
  cvv: z.string()
    .trim()
    .regex(/^\d{3,4}$/, 'El CVV debe tener exactamente 3 o 4 dígitos numéricos'),
});

type PaymentForm = z.infer<typeof paymentSchema>;

const Pago = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const paymentMethod = location.state?.paymentMethod || 'TARJETA';
  const deliveryData = location.state?.deliveryData;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    mode: 'onBlur'
  });

  const onSubmit = (data: PaymentForm) => {
    console.log('✅ Pago validado con éxito:', data);
    showToast('¡Pago confirmado!', 'success');
    navigate('/pedido-finalizado', { 
      replace: true,
      state: { paymentMethod, deliveryData }
    });
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-12 relative"
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2071')" }}>
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Datos de la Tarjeta</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-3xl shadow space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre en la tarjeta</label>
            <input 
              {...register('cardName')} 
              type="text" 
              className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" 
              placeholder="Juan Pérez" 
            />
            {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Número de tarjeta</label>
            <input 
              {...register('cardNumber')} 
              type="text" 
              className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" 
              placeholder="4242424242424242" 
              maxLength={16}
            />
            {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha de expiración</label>
              <input 
                {...register('expirationDate')} 
                type="text" 
                className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" 
                placeholder="MM/AA" 
                maxLength={5}
              />
              {errors.expirationDate && <p className="text-red-500 text-sm mt-1">{errors.expirationDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CVV</label>
              <input 
                {...register('cvv')} 
                type="text" 
                className="w-full p-4 border border-gray-300 rounded-3xl focus:outline-none focus:border-green-600" 
                placeholder="123" 
                maxLength={4}
              />
              {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-5 rounded-3xl text-xl font-semibold hover:bg-green-700 disabled:opacity-70 transition"
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar Pago'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Pago;