import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthPage } from './features/auth/AuthPage';
import { ChatPage } from './features/chat/ChatPage';
import { useAuthStore } from './store/auth.store';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const credentials = useAuthStore((state) => state.credentials);
  return credentials ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
