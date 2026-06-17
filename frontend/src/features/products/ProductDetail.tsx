import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { API_URL } from '../../services/api';
import type { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../context/ToastContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data);
        
        try {
          const ratingRes = await api.get(`/api/reviews/average/${response.data.username}`);
          setAvgRating(ratingRes.data.average || 0);
        } catch (err) {
          console.error("Error fetching average rating:", err);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const isOwner = user?.username === product?.username;

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      await api.delete(`/api/products/${id}`);
      showToast('Producto eliminado correctamente', 'success');
      navigate('/my-products');
    } catch {
      showToast('Error al eliminar el producto', 'error');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const added = addToCart(product);
      if (added) {
        showToast('Producto añadido al carrito', 'success');
      } else {
        showToast('Este producto ya está en el carrito', 'info');
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-light">Cargando...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-light">Producto no encontrado</div>;

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-primary hover:underline font-medium">
          ← Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <img
              src={product.imageUrl ? `${API_URL}${product.imageUrl}` : 'https://picsum.photos/id/1015/800/600'}
              alt={product.title}
              className="w-full h-[500px] object-cover rounded-3xl"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-dark">{product.title}</h1>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-3xl font-semibold text-primary">{product.price.toFixed(2)} €</p>
              {product.isSold && (
                <span className="bg-red-100 text-red-700 font-bold px-4 py-1.5 rounded-2xl text-sm border border-red-300 uppercase">
                  Vendido
                </span>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <span className="px-5 py-2 bg-gray-100 rounded-3xl text-sm">{product.category}</span>
              <span className="px-5 py-2 bg-gray-100 rounded-3xl text-sm">{product.condition}</span>
            </div>

            <p className="mt-8 text-gray-700">
              Publicado por{' '}
              <Link to={`/profile/${product.username}`} className="font-bold text-primary hover:underline">
                @{product.username}
              </Link>
              {avgRating !== null && (
                <span className="ml-3 text-yellow-500 font-semibold text-sm">
                  ⭐ {avgRating > 0 ? avgRating.toFixed(1) : 'Sin valoraciones'}
                </span>
              )}
            </p>

            <div className="my-10 border-t border-b py-8">
              <h3 className="font-semibold mb-4">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-4">
              {}
              {!isOwner && (
                <>
                  {product.isSold ? (
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white py-5 rounded-3xl text-xl font-semibold cursor-not-allowed"
                    >
                      🤝 Vendido
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-primary hover:bg-green-600 text-white py-5 rounded-3xl text-xl font-semibold transition"
                    >
                      🛒 Añadir al carrito
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/chats?user=${product.username}`)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-3xl text-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    💬 Preguntar al Vendedor
                  </button>
                </>
              )}

              {}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-3xl text-xl font-semibold transition"
                >
                  🗑 Eliminar producto
                </button>
              )}

              {isOwner && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Este es tu producto
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;