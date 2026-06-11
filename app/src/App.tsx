import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Compare from './pages/Compare';
import LoginRegister from './pages/LoginRegister';
import UserProfile from './pages/UserProfile';
import Admin from './pages/Admin';
import { useProductStore } from './stores/useProductStore';
import { useAuthStore } from './stores/useAuthStore';

function AppInit() {
  const fetchAll = useProductStore(s => s.fetchAll);
  const restoreSession = useAuthStore(s => s.restoreSession);
  useEffect(() => {
    fetchAll();
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <AppInit />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:category" element={<Catalog />} />
          <Route path="/catalog/:category/:subcategory" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/:tab" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
