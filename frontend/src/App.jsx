import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import BusinessSelect from './pages/BusinessSelect';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import AddInventory from './pages/AddInventory';
import InventoryList from './pages/InventoryList';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/business-select" element={
          <ProtectedRoute>
            <BusinessSelect />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/add-transaction" element={
          <ProtectedRoute>
            <AddTransaction />
          </ProtectedRoute>
        } />

        <Route path="/add-inventory" element={
          <ProtectedRoute>
            <AddInventory />
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute>
            <InventoryList />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
