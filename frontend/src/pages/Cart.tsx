import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { API_URL } from '../services/api';
import EmptyState from '../Components/EmptyState';
import type { CartItem } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta'>('efectivo');

  const handleCheckout = () => {
    if (cart.length === 0) return;

    
    navigate('/datos-entrega', { 
      state: { paymentMethod } 
    });
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2071')"
      }}
    >
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Tu Carrito</h1>

        {cart.length === 0 ? (
          <EmptyState
            title="Tu carrito está vacío"
            message="Añade productos desde el catálogo"
            icon="🛒"
            actionLabel="Ir al catálogo"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {cart.map((item: CartItem) => (
                <div key={item.id} className="flex gap-6 bg-white p-6 rounded-3xl shadow">
                  <img
                    src={item.imageUrl ? `${API_URL}${item.imageUrl}` : 'https://picsum.photos/id/1015/300/200'}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl">{item.title}</h3>
                    <p className="text-gray-500">{item.category} • {item.condition}</p>
                    <p className="text-primary font-bold mt-2">
                      {item.price.toFixed(2)} €
                    </p>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600 text-2xl">✕</button>
                    <p className="font-semibold text-xl">
                      {item.price.toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white p-8 rounded-3xl shadow sticky top-8">
                <h2 className="text-2xl font-semibold mb-6">Resumen del pedido</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-lg">Productos ({getTotalItems()})</span>
                    <span className="text-lg font-medium">{getTotalPrice().toFixed(2)} €</span>
                  </div>
                  <div className="border-t pt-6">
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">{getTotalPrice().toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium mb-3">Método de pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'efectivo' | 'tarjeta')}
                    className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary"
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta">💳 Tarjeta</option>
                  </select>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-green-600 text-white py-5 rounded-3xl text-xl font-semibold transition"
                >
                  Continuar con la compra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;