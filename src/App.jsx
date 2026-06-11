import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Landing Pages
import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';
import CareerPage from './pages/CareerPage';

// Admin — eagerly loaded (critical path)
import Login from './Login';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import NotFoundPage from './pages/NotFoundPage';

// Admin — lazily loaded (non-critical)
const RolesPage = lazy(() => import('./pages/RolesPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const RestaurantProfilePage = lazy(() => import('./pages/RestaurantProfilePage'));
const KitchenPage = lazy(() => import('./pages/KitchenPage'));
const MarketingPage = lazy(() => import('./pages/MarketingPage'));
const TablePage = lazy(() => import('./pages/TablePage'));
const OutletsPage = lazy(() => import('./pages/OutletsPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const BrandsAdminPage = lazy(() => import('./pages/BrandsAdminPage'));

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing / Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/career" element={<CareerPage />} />

        {/* Admin Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin Pages (protected + wrapped with Sidebar) */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/brands" element={
            <Suspense fallback={<LoadingSpinner fullPage />}><BrandsAdminPage /></Suspense>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roles" element={
            <Suspense fallback={<LoadingSpinner fullPage />}><RolesPage /></Suspense>
          } />
          <Route path="/order" element={
            <Suspense fallback={<LoadingSpinner fullPage />}><OrderPage /></Suspense>
          } />
          <Route path="/restaurant-profile" element={
            <Suspense fallback={<LoadingSpinner fullPage />}><RestaurantProfilePage /></Suspense>
          } />
          <Route path="/kitchen" element={
            <Suspense fallback={<LoadingSpinner fullPage />}><KitchenPage /></Suspense>
          } />
          <Route path="/marketing" element={
            <Suspense fallback={<LoadingSpinner fullPage />}><MarketingPage /></Suspense>
          } />
          <Route path="/table" element={
            <Suspense fallback={<LoadingSpinner fullPage />}><TablePage /></Suspense>
          } />
          <Route
            path="/outlets"
            element={
              <ProtectedRoute permission="outlet.view">
                <Suspense fallback={<LoadingSpinner fullPage />}><OutletsPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute permission="staff.view">
                <Suspense fallback={<LoadingSpinner fullPage />}><StaffPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute permission="products.view">
                <Suspense fallback={<LoadingSpinner fullPage />}><MenuPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute permission="orders.view">
                <Suspense fallback={<LoadingSpinner fullPage />}><OrdersPage /></Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
