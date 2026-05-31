import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Landing Pages
import LandingPage from './pages/LandingPage';
import BrandPage from './pages/BrandPage';
import ContactPage from './pages/ContactPage';
import CareerPage from './pages/CareerPage';

// Admin
import Login from './Login';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './Dashboard';
import RolesPage from './pages/RolesPage';
import OrderPage from './pages/OrderPage';
import RestaurantProfilePage from './pages/RestaurantProfilePage';
import KitchenPage from './pages/KitchenPage';
import MarketingPage from './pages/MarketingPage';
import TablePage from './pages/TablePage';
import OutletsPage from './pages/OutletsPage';
import StaffPage from './pages/StaffPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing / Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/brand" element={<BrandPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/career" element={<CareerPage />} />

        {/* Admin Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin Pages (protected + wrapped with Sidebar) */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/restaurant-profile" element={<RestaurantProfilePage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/table" element={<TablePage />} />
          <Route
            path="/outlets"
            element={
              <ProtectedRoute permission="outlet.view">
                <OutletsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute permission="staff.view">
                <StaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute permission="products.view">
                <MenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute permission="orders.view">
                <OrdersPage />
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
