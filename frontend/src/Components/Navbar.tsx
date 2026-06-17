import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  if (isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logout(); 
    navigate('/login', { replace: true });
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 150);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            ♻️ EcoSwap
          </Link>

          {/* 🔐 MENÚ PARA USUARIOS LOGUEADOS (No Admins) */}
          {isAuthenticated && user && !isAdmin && (
            <div className="flex items-center gap-8 text-sm font-medium">
              <Link to="/products" className="hover:text-primary transition-colors">Catálogo</Link>
              <Link to="/my-products" className="hover:text-primary transition-colors">Mis productos</Link>
              <Link to="/favorites" className="hover:text-primary transition-colors">Favoritos</Link>
              <Link to="/my-orders" className="hover:text-primary transition-colors">Mis pedidos</Link>
              <Link to="/chats" className="hover:text-primary transition-colors">Mensajes</Link>
              <Link to="/create-product" className="hover:text-primary transition-colors">Crear producto</Link>
              <Link to="/profile" className="hover:text-primary transition-colors">Mi Perfil</Link>
              <Link to="/cart" className="hover:text-primary transition-colors flex items-center gap-1.5">
                🛒 Carrito
                {cart.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold text-white bg-green-600 rounded-full animate-pulse">
                    {cart.length}
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* 🛠️ INDICADOR PARA ADMIN */}
          {isAuthenticated && user && isAdmin && (
            <div className="flex items-center gap-6">
              <span className="text-sm font-semibold text-red-600">Panel de Administrador</span>
            </div>
          )}

          {/* 🎛️ BOTÓN DINÁMICO: Cerrar sesión o Iniciar Sesión */}
          <div className="flex items-center">
            {isAuthenticated && user ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-3xl transition-colors"
              >
                Cerrar sesión
              </button>
            ) : (
              // ¡Esto es lo que aparecerá cuando no haya sesión!
              <Link
                to="/login"
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-3xl transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;