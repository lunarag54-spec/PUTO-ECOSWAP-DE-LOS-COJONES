import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  username: string;
}

interface CategoryStat {
  category: string;
  count: number;
  revenue: number;
}

interface AdminStats {
  totalUsers: number;
  totalActiveProducts: number;
  totalSoldProducts: number;
  totalOrders: number;
  totalRevenue: number;
  categoryStats: CategoryStat[];
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'stats'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/');
      showToast('No tienes permisos de administrador', 'error');
    }
  }, [user, navigate, showToast]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'users') {
          const res = await api.get('/api/admin/users');
          setUsers(res.data);
        } else if (activeTab === 'products') {
          const res = await api.get('/api/admin/products');
          setProducts(res.data);
        } else if (activeTab === 'stats') {
          const res = await api.get('/api/admin/stats');
          setStats(res.data);
        }
      } catch {
        showToast('Error al cargar los datos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, user, showToast]);

  const deleteUser = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este usuario y todos sus productos?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      showToast('Usuario eliminado', 'success');
    } catch {
      showToast('Error al eliminar usuario', 'error');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      showToast('Producto eliminado', 'success');
    } catch {
      showToast('Error al eliminar producto', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setTimeout(() => {
      window.location.href = '/login';
    }, 150);
  };

  const renderStatsTab = () => {
    if (!stats) return <p className="text-center py-8">No hay estadísticas disponibles.</p>;

    const maxRevenue = Math.max(...stats.categoryStats.map(c => c.revenue), 1);
    const chartHeight = 220;
    const chartWidth = 500;
    const padding = 45;

    return (
      <div className="space-y-10">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-3xl p-6 shadow-lg shadow-emerald-500/10">
            <p className="text-sm font-semibold opacity-90">Ingresos Totales</p>
            <p className="text-4xl font-extrabold mt-2">{stats.totalRevenue.toFixed(2)} €</p>
            <div className="text-xs mt-3 bg-white/20 px-3 py-1 rounded-full w-fit">Acumulado General</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-6 shadow-lg shadow-indigo-500/10">
            <p className="text-sm font-semibold opacity-90">Ventas Realizadas</p>
            <p className="text-4xl font-extrabold mt-2">{stats.totalOrders}</p>
            <div className="text-xs mt-3 bg-white/20 px-3 py-1 rounded-full w-fit">Pedidos Totales</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-3xl p-6 shadow-lg shadow-pink-500/10">
            <p className="text-sm font-semibold opacity-90">Usuarios Registrados</p>
            <p className="text-4xl font-extrabold mt-2">{stats.totalUsers}</p>
            <div className="text-xs mt-3 bg-white/20 px-3 py-1 rounded-full w-fit">Coleccionistas Activos</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-lg shadow-orange-500/10">
            <p className="text-sm font-semibold opacity-90">Artículos en Catálogo</p>
            <p className="text-4xl font-extrabold mt-2">{stats.totalActiveProducts}</p>
            <div className="text-xs mt-3 bg-white/20 px-3 py-1 rounded-full w-fit">En catálogo / {stats.totalSoldProducts} vendidos</div>
          </div>
        </div>

        {/* Category breakdown and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side: Stats List */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Desglose por Categoría</h3>
            <div className="space-y-4">
              {stats.categoryStats.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">Aún no hay ventas registradas.</p>
              ) : (
                stats.categoryStats.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.category}</p>
                      <p className="text-xs text-gray-400">{item.count} artículos vendidos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-green-600 text-sm">{item.revenue.toFixed(2)} €</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right side: SVG Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm lg:col-span-2 flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 self-start">Distribución de Ventas por Categoría (€)</h3>
            {stats.categoryStats.length === 0 ? (
              <div className="flex items-center justify-center flex-1 py-12 text-gray-400 text-sm">
                No hay datos suficientes para representar el gráfico.
              </div>
            ) : (
              <div className="w-full flex justify-center overflow-x-auto py-2">
                <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                  {/* Y-axis grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                    const y = padding + (chartHeight - padding * 2) * (1 - ratio);
                    const labelVal = maxRevenue * ratio;
                    return (
                      <g key={index} className="opacity-40">
                        <line
                          x1={padding}
                          y1={y}
                          x2={chartWidth - padding}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={padding - 8}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748b"
                          fontWeight="semibold"
                        >
                          {labelVal.toFixed(0)}€
                        </text>
                      </g>
                    );
                  })}

                  {/* X-axis base line */}
                  <line
                    x1={padding}
                    y1={chartHeight - padding}
                    x2={chartWidth - padding}
                    y2={chartHeight - padding}
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  />

                  {/* Bars */}
                  {stats.categoryStats.map((item, idx) => {
                    const numItems = stats.categoryStats.length;
                    const availWidth = chartWidth - padding * 2;
                    const barSpacing = availWidth / numItems;
                    const barWidth = Math.min(barSpacing * 0.6, 40);
                    const x = padding + idx * barSpacing + (barSpacing - barWidth) / 2;

                    const height = maxRevenue > 0 
                      ? ((item.revenue) / maxRevenue) * (chartHeight - padding * 2) 
                      : 0;
                    const y = chartHeight - padding - height;

                    return (
                      <g key={idx} className="group cursor-pointer">
                        <defs>
                          <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#047857" stopOpacity="0.95" />
                          </linearGradient>
                        </defs>

                        {/* Bar rect */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={height}
                          fill={`url(#grad-${idx})`}
                          rx="6"
                          className="transition-all duration-300 hover:brightness-110 hover:shadow-md"
                        />

                        {/* Value label on top */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 8}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#0f172a"
                          fontWeight="bold"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          {item.revenue.toFixed(0)}€
                        </text>

                        {/* Category Label at bottom */}
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight - padding + 18}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#64748b"
                          fontWeight="bold"
                        >
                          {item.category.length > 8 ? `${item.category.slice(0, 7)}.` : item.category}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-dark dark:text-white">♻️ EcoSwap - Panel de Administración</h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-3xl transition"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 border-b mb-8">
          <button onClick={() => setActiveTab('users')}
            className={`px-8 py-4 font-semibold rounded-t-3xl transition ${activeTab === 'users' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
             Usuarios
          </button>
          <button onClick={() => setActiveTab('products')}
            className={`px-8 py-4 font-semibold rounded-t-3xl transition ${activeTab === 'products' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
             Todos los Productos
          </button>
          <button onClick={() => setActiveTab('stats')}
            className={`px-8 py-4 font-semibold rounded-t-3xl transition ${activeTab === 'stats' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
             Estadísticas
          </button>
        </div>

        {loading ? (
          <p className="text-center py-12 text-xl">Cargando...</p>
        ) : activeTab === 'users' ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Usuario</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Rol</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">{u.id}</td>
                    <td className="px-6 py-4 font-medium">{u.username}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'products' ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Producto</th>
                  <th className="px-6 py-4 text-left">Precio</th>
                  <th className="px-6 py-4 text-left">Propietario</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">{p.id}</td>
                    <td className="px-6 py-4 font-medium">{p.title}</td>
                    <td className="px-6 py-4">{p.price.toFixed(2)} €</td>
                    <td className="px-6 py-4">{p.username}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          renderStatsTab()
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;