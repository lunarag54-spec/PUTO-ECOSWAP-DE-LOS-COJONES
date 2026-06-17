import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import EmptyState from '../../Components/EmptyState';
import SkeletonCard from '../../Components/SkeletonCard';
import { useProductsLoader } from '../../hooks/useProductsLoader';

const Favorites = () => {
  const navigate = useNavigate();
  const { products: favorites, loading } = useProductsLoader('/api/favorites', 'Error al cargar tus favoritos');

  return (
    <div className="min-h-[calc(100vh-72px)] bg-light dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="mb-8 text-4xl font-bold text-dark dark:text-white">Mis Favoritos</h1>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No tienes favoritos todavía"
            message="Los productos que marques con ❤️ aparecerán aquí"
            icon="❤️"
            actionLabel="Ir al catálogo"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favorites.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;