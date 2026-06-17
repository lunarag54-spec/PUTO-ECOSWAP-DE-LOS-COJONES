import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './Components/ToastContainer';


import Navbar from './Components/Navbar';
import Footer from './Components/Footer';


import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './features/products/Products';
import CreateProduct from './features/products/CreateProduct';
import MyProducts from './features/products/MyProducts';
import Favorites from './features/products/Favorites';
import Cart from './pages/Cart';
import DatosEntrega from './pages/DatosEntrega';
import Pago from './pages/Pago';
import PedidoFinalizado from './pages/PedidoFinalizado';
import ProductDetail from './features/products/ProductDetail';
import AdminDashboard from './features/admin/AdminDashboard';
import MyOrders from './features/orders/MyOrders';
import Profile from './pages/Profile';
import Chats from './pages/Chats';


import EditProduct from './pages/EditProduct';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <div className="flex flex-col min-h-screen">

              <Navbar />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route path="/create-product" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
                  <Route path="/my-products" element={<ProtectedRoute><MyProducts /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/datos-entrega" element={<ProtectedRoute><DatosEntrega /></ProtectedRoute>} />
                  <Route path="/pago" element={<ProtectedRoute><Pago /></ProtectedRoute>} />
                  <Route path="/pedido-finalizado" element={<ProtectedRoute><PedidoFinalizado /></ProtectedRoute>} />
                  <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/:profileUsername" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
                  <Route path="/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
          <ToastContainer />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;