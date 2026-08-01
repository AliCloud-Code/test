import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import PortfolioPage from './pages/PortfolioPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<PortfolioPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}