import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { AcceptInvite } from './pages/AcceptInvite';
import { Scan } from './pages/Scan';
import { Stock } from './pages/Stock';
import { Settings } from './pages/Settings';
import { AddProduct } from './pages/AddProduct';
import { Products } from './pages/Products';
import { UserManagement } from './pages/UserManagement';
import { Companies } from './pages/Companies';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<AddProduct />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/company" element={<Companies />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
