import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/auth/RouteGuards'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import NotFound from './pages/NotFound'
import { PayPalSuccess, PayPalCancel } from './pages/PayPalResult'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// User
import Profile from './pages/user/Profile'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminImageManager from './pages/admin/AdminImageManager'
import AdminCategories from './pages/admin/AdminCategories'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              {/* Public */}
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />

              {/* Guest only */}
              <Route path="login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="register" element={<GuestRoute><Register /></GuestRoute>} />

              {/* Protected */}
              <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* PayPal callbacks */}
              <Route path="paypal/success" element={<PayPalSuccess />} />
              <Route path="paypal/cancel" element={<PayPalCancel />} />

              {/* Admin */}
              <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
              <Route path="admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
              <Route path="admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
              <Route path="admin/products/:id/images" element={<AdminRoute><AdminImageManager /></AdminRoute>} />
              <Route path="admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
