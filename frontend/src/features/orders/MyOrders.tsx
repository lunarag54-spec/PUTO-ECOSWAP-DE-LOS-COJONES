import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { API_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../Components/EmptyState';

interface UserInfo {
  id: number;
  username: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
}

interface OrderItem {
  id: number;
  title: string;
  price: number;
  imageUrl?: string;
  productId?: number;
  seller?: UserInfo;
}

interface Order {
  id: number;
  total: number;
  paymentMethod: string;
  orderDate?: string;
  status: string; // PENDING, SHIPPED, DELIVERED
  fullName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  user?: UserInfo; // Buyer info (relevant for sales)
  items: OrderItem[];
}

const MyOrders = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSellerId, setReviewSellerId] = useState<number | null>(null);
  const [reviewOrderId, setReviewOrderId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedKeys, setReviewedKeys] = useState<Record<string, boolean>>({});

  const fetchOrdersAndSales = async () => {
    try {
      setLoading(true);
      const [ordersRes, salesRes] = await Promise.all([
        api.get('/api/orders/my-orders'),
        api.get('/api/orders/my-sales')
      ]);
      setOrders(ordersRes.data);
      setSales(salesRes.data);
    } catch (error) {
      console.error(error);
      showToast('Error al cargar la información de pedidos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchOrdersAndSales();
  }, [user]);

  const handleUpdateStatus = async (orderId: number, nextStatus: 'SHIPPED' | 'DELIVERED') => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: nextStatus });
      showToast(
        nextStatus === 'SHIPPED' 
          ? 'Pedido marcado como enviado' 
          : '¡Recepción confirmada con éxito!', 
        'success'
      );
      fetchOrdersAndSales();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al actualizar el estado';
      showToast(msg, 'error');
    }
  };

  const openReviewModal = (sellerId: number, orderId: number) => {
    setReviewSellerId(sellerId);
    setReviewOrderId(orderId);
    setReviewRating(5);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const handleSendReview = async () => {
    if (!reviewSellerId || !reviewOrderId) return;
    try {
      setSubmittingReview(true);
      await api.post('/api/reviews', {
        sellerId: reviewSellerId,
        orderId: reviewOrderId,
        rating: reviewRating,
        comment: reviewComment
      });
      showToast('¡Valoración enviada correctamente!', 'success');
      setReviewedKeys(prev => ({
        ...prev,
        [`${reviewOrderId}_${reviewSellerId}`]: true
      }));
      setIsReviewModalOpen(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al enviar la valoración';
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleGenerateInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Por favor, permite las ventanas emergentes para descargar el recibo', 'error');
      return;
    }

    const itemsRows = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${item.price.toFixed(2)} €</td>
      </tr>
    `).join('');

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo EcoSwap - Pedido #${order.id}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 40px;
            line-height: 1.6;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            color: #64748b;
          }
          .details-grid {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 40px;
          }
          .details-grid > div {
            flex: 1;
          }
          .section-title {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: bold;
            color: #94a3b8;
            margin-bottom: 8px;
            letter-spacing: 0.05em;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .table th {
            background-color: #f8fafc;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #e2e8f0;
          }
          .total-box {
            margin-left: auto;
            width: 300px;
            border-top: 2px solid #e2e8f0;
            padding-top: 15px;
            margin-bottom: 40px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            font-size: 12px;
            color: #64748b;
            margin-top: 60px;
          }
          .eco-badge {
            background-color: #ecfdf5;
            color: #065f46;
            padding: 16px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
            margin-top: 20px;
            border: 1px solid #a7f3d0;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">♻️ EcoSwap</div>
          <div class="title">COMPROBANTE DE COMPRA</div>
        </div>

        <div class="details-grid">
          <div>
            <div class="section-title">Detalles del Pedido</div>
            <p><strong>Pedido ID:</strong> #EC-${order.id}</p>
            <p><strong>Fecha:</strong> ${order.orderDate ? new Date(order.orderDate).toLocaleDateString('es-ES') : 'N/A'}</p>
            <p><strong>Método de Pago:</strong> ${order.paymentMethod}</p>
            <p><strong>Estado:</strong> Entregado</p>
          </div>
          <div>
            <div class="section-title">Dirección de Entrega</div>
            <p><strong>Nombre:</strong> ${order.fullName || 'N/A'}</p>
            <p><strong>Dirección:</strong> ${order.address || 'N/A'}</p>
            <p><strong>Ciudad/CP:</strong> ${order.city || 'N/A'} (${order.postalCode || 'N/A'})</p>
            <p><strong>Teléfono:</strong> ${order.phone || 'N/A'}</p>
          </div>
        </div>

        <div class="section-title">Artículos Adquiridos</div>
        <table class="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align: right;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${order.total.toFixed(2)} €</span>
          </div>
          <div class="total-row">
            <span>Envío:</span>
            <span style="color: #059669; font-weight: 500;">Gratis (Promoción TFG)</span>
          </div>
          <div class="total-row grand-total" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f9;">
            <span>Total:</span>
            <span>${order.total.toFixed(2)} €</span>
          </div>
        </div>

        <div class="eco-badge">
          🌱 <strong>Impacto Ecológico Positivo:</strong> Al adquirir artículos de segunda mano en EcoSwap, has prolongado su ciclo de vida útil, reduciendo la huella de carbono y evitando la extracción de nuevas materias primas. ¡Gracias por apostar por la sostenibilidad!
        </div>

        <div class="footer">
          EcoSwap S.L. &copy; 2026 - Conectando Coleccionistas y Cuidando del Planeta.<br>
          Este documento sirve como comprobante de entrega y compra oficial.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SHIPPED':
        return <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">📦 EN CAMINO</span>;
      case 'DELIVERED':
        return <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">✅ ENTREGADO</span>;
      case 'PENDING':
      default:
        return <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">⏳ PENDIENTE</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500 mt-4 font-medium">Cargando tus pedidos...</p>
      </div>
    );
  }

  const activeOrders = activeTab === 'purchases' ? orders : sales;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-950 tracking-tight">Gestión de Pedidos</h1>
            <p className="text-gray-500 mt-1">Sigue el estado de tus compras y ventas</p>
          </div>

          {/* Tab buttons */}
          <div className="flex bg-gray-200/60 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'purchases'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🛍️ Mis Compras
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'sales'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💰 Mis Ventas
            </button>
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <EmptyState
            title={activeTab === 'purchases' ? 'Aún no tienes compras' : 'Aún no tienes ventas'}
            message={
              activeTab === 'purchases'
                ? 'Cuando realices un pedido del catálogo, aparecerá aquí.'
                : 'Cuando otros usuarios compren tus artículos, aparecerán aquí.'
            }
            icon={activeTab === 'purchases' ? '📦' : '💵'}
            actionLabel={activeTab === 'purchases' ? 'Ver catálogo' : 'Subir producto'}
            onAction={() => window.location.href = activeTab === 'purchases' ? '/products' : '/publish'}
          />
        ) : (
          <div className="space-y-6">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition duration-300 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-100 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
                      Pedido #{order.id}
                    </span>
                    <h3 className="text-sm text-gray-500 mt-0.5">
                      Realizado el:{' '}
                      <span className="font-medium text-gray-800">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Fecha no disponible'}
                      </span>
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentMethod === 'EFECTIVO'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {order.paymentMethod === 'EFECTIVO' ? '💵 Efectivo' : '💳 Tarjeta'}
                    </span>
                    {getStatusBadge(order.status)}
                    <span className="text-xl font-extrabold text-green-600">
                      {order.total.toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Items and Delivery Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Items List */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Artículos
                    </h4>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100"
                      >
                        <img
                          src={
                            item.imageUrl
                              ? `${API_URL}${item.imageUrl}`
                              : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=120'
                          }
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-200 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 truncate text-sm">
                            {item.title}
                          </h5>
                          {activeTab === 'purchases' && item.seller && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Vendedor:{' '}
                              <span className="font-semibold text-gray-600">
                                @{item.seller.username}
                              </span>
                            </p>
                          )}
                          <p className="text-sm font-bold text-green-600 mt-1">
                            {item.price.toFixed(2)} €
                          </p>
                        </div>

                        {/* Action Buttons for Purchases (Review Seller) */}
                        {activeTab === 'purchases' &&
                          order.status === 'DELIVERED' &&
                          item.seller && (
                            <div className="ml-auto">
                              {reviewedKeys[`${order.id}_${item.seller.id}`] ? (
                                <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-200 font-medium">
                                  ⭐ Valorado
                                </span>
                              ) : (
                                <button
                                  onClick={() => openReviewModal(item.seller!.id, order.id)}
                                  className="text-xs bg-gray-900 text-white hover:bg-gray-800 px-3.5 py-2 rounded-xl transition font-semibold"
                                >
                                  Valorar Vendedor
                                </button>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info and Actions */}
                  <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/80 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {activeTab === 'purchases' ? 'Dirección de Entrega' : 'Datos del Comprador'}
                      </h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        {activeTab === 'sales' && order.user && (
                          <p>
                            <span className="font-semibold text-gray-500">Usuario:</span> @
                            {order.user.username}
                          </p>
                        )}
                        <p>
                          <span className="font-semibold text-gray-500">Nombre:</span>{' '}
                          {order.fullName || 'No provisto'}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-500">Dirección:</span>{' '}
                          {order.address || 'No provista'}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-500">Ciudad/CP:</span>{' '}
                          {order.city && order.postalCode
                            ? `${order.city} (${order.postalCode})`
                            : 'No provista'}
                        </p>
                        {order.phone && (
                          <p>
                            <span className="font-semibold text-gray-500">Teléfono:</span>{' '}
                            {order.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order cycle actions */}
                    <div className="mt-6 pt-4 border-t border-gray-200/60">
                      {activeTab === 'purchases' && order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl text-sm font-semibold transition"
                        >
                          Confirmar Recepción
                        </button>
                      )}

                      {activeTab === 'sales' && order.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-semibold transition"
                        >
                          Marcar como Enviado
                        </button>
                      )}

                      {order.status === 'DELIVERED' && (
                        <>
                          <p className="text-center text-xs font-semibold text-green-600 flex items-center justify-center gap-1.5 mb-2.5">
                            ✓ Pedido completado y entregado
                          </p>
                          <button
                            onClick={() => handleGenerateInvoice(order)}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                          >
                            📋 Descargar Recibo
                          </button>
                        </>
                      )}

                      {activeTab === 'purchases' && order.status === 'PENDING' && (
                        <p className="text-center text-xs font-semibold text-amber-600">
                          Esperando a que el vendedor envíe el paquete...
                        </p>
                      )}

                      {activeTab === 'sales' && order.status === 'SHIPPED' && (
                        <p className="text-center text-xs font-semibold text-blue-600">
                          El paquete está en camino. Esperando confirmación del comprador...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Valorar al Vendedor</h3>
            <p className="text-gray-500 text-sm mb-6">
              Tu valoración ayudará a otros miembros de la comunidad a comprar de forma más segura.
            </p>

            <div className="space-y-6">
              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Calificación (Estrellas)
                </label>
                <div className="flex gap-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-3xl focus:outline-none transition transform hover:scale-110 active:scale-95"
                    >
                      {star <= reviewRating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Tu reseña (Comentario)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe tu experiencia de compra..."
                  rows={4}
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition"
                ></textarea>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  disabled={submittingReview}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3.5 rounded-2xl transition text-sm disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendReview}
                  disabled={submittingReview || !reviewComment.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-2xl transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingReview ? 'Enviando...' : 'Enviar Valoración'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;