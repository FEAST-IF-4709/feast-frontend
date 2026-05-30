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
        </Route>
      </Routes>
    </Router>
  );
};

export default App;