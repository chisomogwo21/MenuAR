import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Customer Pages
import MenuHome from './pages/customer/MenuHome';
import DishDetail from './pages/customer/DishDetail';
import ARPreview from './pages/customer/ARPreview';
import Cart from './pages/customer/Cart';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import PrivateRoute from './components/admin/PrivateRoute';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import MenuManager from './pages/admin/MenuManager';
import Tables from './pages/admin/Tables';
import Settings from './pages/admin/Settings';

// Super Admin Pages
import Restaurants from './pages/superadmin/Restaurants';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Customer Routes */}
          <Route path="/:slug/menu" element={<MenuHome />} />
          <Route path="/:slug/dish/:id" element={<DishDetail />} />
          <Route path="/:slug/ar/:id" element={<ARPreview />} />
          <Route path="/:slug/cart" element={<Cart />} />
          <Route path="/:slug/order-confirmation" element={<OrderConfirmation />} />

          {/* Admin Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/menu" element={<MenuManager />} />
            <Route path="/admin/tables" element={<Tables />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="/superadmin/restaurants" element={<Restaurants />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/savanna-grill/menu" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
