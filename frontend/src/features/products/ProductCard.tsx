import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import api, { API_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useState, useEffect } from 'react';

const ProductCard = ({ product }: { product: Product }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const res = await api.get('/api/favorites');
        const favorites = res.data;
        setIsFavorite(favorites.some((f: { id: Product['id'] }) => f.id === product.id));
      } catch {
        
      }
    };
    if (isAuthenticated) checkFavorite();
  }, [product.id, isAuthenticated]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/api/favorites/${product.id}`);
        showToast('Eliminado de favoritos', 'success');
      } else {
        await api.post(`/api/favorites/${product.id}`);
        showToast('Añadido a favoritos', 'success');
      }
      setIsFavorite(!isFavorite);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = typeof axiosError.response?.data?.message === 'string'
        ? axiosError.response.data.message
        : error instanceof Error
          ? error.message
          : 'Error';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group block relative">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative">
          <img
            src={product.imageUrl ? `${API_URL}${product.imageUrl}` : 'https://picsum.photos/id/1015/300/200'}
            alt={product.title}
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {product.isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="bg-red-600 text-white font-bold text-lg px-6 py-2 rounded-2xl shadow-lg uppercase tracking-wider">
                Vendido
              </span>
            </div>
          )}

          {isAuthenticated && !product.isSold && (
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600 text-3xl z-20 w-10 h-10 flex items-center justify-center rounded-2xl shadow transition-all hover:scale-110 active:scale-95"
            >
              {isFavorite ? '❤️' : '♡'}
            </button>
          )}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <span className="text-primary font-bold text-2xl ml-4">
              {product.price.toFixed(2)} €
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{product.category} • {product.condition}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">por {product.username}</p>
        </div>
      </div>

      {}
      {}
    </Link>
  );
};

export default ProductCard;