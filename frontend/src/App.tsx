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

                  <Route path="/create-product" element={<CreateProduct />} />
                  <Route path="/my-products" element={<MyProducts />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/datos-entrega" element={<DatosEntrega />} />
                  <Route path="/pago" element={<Pago />} />
                  <Route path="/pedido-finalizado" element={<PedidoFinalizado />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:profileUsername" element={<Profile />} />
                  <Route path="/chats" element={<Chats />} />
                  <Route path="/edit-product/:id" element={<EditProduct />} />

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