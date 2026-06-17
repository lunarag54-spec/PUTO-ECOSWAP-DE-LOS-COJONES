import { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../../Components/EmptyState';
import SkeletonCard from '../../Components/SkeletonCard';
import api from '../../services/api';
import type { Product } from '../../types';
import { useToast } from '../../context/ToastContext';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const categories = ['Videojuegos', 'Música', 'Electrónica', 'Moda', 'Deportes', 'Hogar', 'Otros'];
  const conditions = ['NEW', 'LIKE_NEW', 'USED', 'DAMAGED', 'REFURBISHED'];

  // Debounce search term changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number> = {
        page: 0,
        size: 20,
        sortBy: 'createdAt',
        direction: 'desc',
      };

      if (debouncedSearchTerm.trim()) params.search = debouncedSearchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCondition) params.condition = selectedCondition;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const response = await api.get('/api/products', { params });

      const data = response.data.content || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showToast('Error al cargar los productos', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [showToast, debouncedSearchTerm, selectedCategory, selectedCondition, minPrice, maxPrice]);

  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };
    loadProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-6">Catálogo de Productos</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-6 rounded-3xl shadow">
            {}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Buscar por título o palabra clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary"
              />
            </div>

            {}
            <div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary">
                <option value="">Todas las categorías</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {}
            <div>
              <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)} className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary">
                <option value="">Cualquier estado</option>
                {conditions.map(cond => (
                  <option key={cond} value={cond}>
                    {cond === 'NEW' ? 'Nuevo' :
                      cond === 'LIKE_NEW' ? 'Como nuevo' :
                        cond === 'USED' ? 'Usado' :
                          cond === 'DAMAGED' ? 'Con desperfectos' : 'Reacondicionado'}
                  </option>
                ))}
              </select>
            </div>

            {}
            <div className="flex gap-3">
              <input type="number" placeholder="Precio min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary" />
              <input type="number" placeholder="Precio max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full p-4 border rounded-3xl focus:outline-none focus:border-primary" />
            </div>

            <div className="lg:col-span-5 flex justify-end">
              <button onClick={clearFilters} className="px-8 py-3 text-sm font-semibold border border-gray-300 rounded-3xl hover:bg-gray-100 transition">
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState title="No se encontraron productos" message="Prueba con otros filtros o términos" icon="🔎" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;