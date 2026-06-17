import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../context/ToastContext';
import { useEffect, useRef } from 'react';
import api from '../services/api';

const PedidoFinalizado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const { showToast } = useToast();

  
  const paymentMethod = location.state?.paymentMethod || 'EFECTIVO';
  const deliveryData = location.state?.deliveryData || {};

  
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current || cart.length === 0) return;

    hasProcessed.current = true;

    const procesarCompra = async () => {
      try {
        const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

        await api.post('/api/orders', {
          items: cart.map(item => ({
            productId: item.id,
            title: item.title,
            price: item.price,
            imageUrl: item.imageUrl
          })),
          total: total,
          paymentMethod: paymentMethod,
          fullName: deliveryData.fullName || '',
          address: deliveryData.address || '',
          city: deliveryData.city || '',
          postalCode: deliveryData.postalCode || '',
          phone: deliveryData.phone || ''
        });

        clearCart();
        showToast('¡Compra realizada con éxito!', 'success');
      } catch (error: any) {
        console.error(error);
        const errorMessage = error.response?.data?.message || 'Error al procesar la compra';
        showToast(errorMessage, 'error');
        navigate('/cart');
      }
    };

    procesarCompra();
  }, [cart, clearCart, showToast, paymentMethod, deliveryData, navigate]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-12 relative"
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2071')" }}>
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-5xl font-bold text-white mb-6">¡Pedido Realizado!</h1>
        <p className="text-xl text-white/90 mb-10">
          Gracias por tu compra.<br />
          Los productos han sido eliminados y guardados en Mis Pedidos.
        </p>

        <button
          onClick={() => navigate('/my-orders')}
          className="bg-white text-gray-900 px-10 py-4 rounded-3xl text-xl font-semibold hover:bg-gray-100 transition"
        >
          Ver Mis Pedidos
        </button>
      </div>
    </div>
  );
};

export default PedidoFinalizado;