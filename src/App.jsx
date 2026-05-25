import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SwipePage from './pages/SwipePage';
import SellListPage from './pages/SellListPage';
import KeepListPage from './pages/KeepListPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<SwipePage />} />
          <Route path="/sell-list" element={<SellListPage />} />
          <Route path="/keep-list" element={<KeepListPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
