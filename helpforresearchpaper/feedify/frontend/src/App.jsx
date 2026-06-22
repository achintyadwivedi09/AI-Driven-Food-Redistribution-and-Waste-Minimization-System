import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import { BottomTabs } from './components/BottomTabs';
import { Toaster } from 'react-hot-toast';
import { useUnreadBadge } from './hooks/useSupabaseRealtime';

export default function App() {
  const unreadCount = useUnreadBadge();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white pb-16 md:pb-0">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/ngo" element={<NgoDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
        <BottomTabs unreadCount={unreadCount} />
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: '#1f2937', color: '#fff', border: '1px solid #374151'
          }
        }} />
      </div>
    </BrowserRouter>
  );
}
