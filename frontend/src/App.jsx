import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Timeline from './pages/Timeline';
import AdminDashboard from './pages/AdminDashboard';
import CreateForm from './pages/CreateForm';
import EditForm from './pages/EditForm';
import ViewResponses from './pages/ViewResponses';
import ApplyForm from './pages/ApplyForm';
import SuccessPage from './pages/SuccessPage';
import Applicants from './pages/Applicants';
import Analytics from './pages/Analytics';
import TopNav from './components/BottomNav';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          <Route path="/admin" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/forms/new" element={<ProtectedRoute><CreateForm /></ProtectedRoute>} />
          <Route path="/admin/forms/:id/edit" element={<ProtectedRoute><EditForm /></ProtectedRoute>} />
          <Route path="/admin/forms/:id/responses" element={<ProtectedRoute><ViewResponses /></ProtectedRoute>} />
          <Route path="/forms/:formId/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/admin/applicants" element={<ProtectedRoute><Applicants /></ProtectedRoute>} />
          
          <Route path="/apply/:formId" element={<ApplyForm />} />
          <Route path="/apply/:formId/success" element={<SuccessPage />} />
        </Routes>
        <TopNav />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
