import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Timeline from './pages/Timeline';
import AdminDashboard from './pages/AdminDashboard';
import CreateForm from './pages/CreateForm';
import EditForm from './pages/EditForm';
import ViewResponses from './pages/ViewResponses';
import ApplyForm from './pages/ApplyForm';
import SuccessPage from './pages/SuccessPage';
import Applicants from './pages/Applicants';
import TopNav from './components/BottomNav';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        <Route path="/admin" element={<Timeline />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/forms/new" element={<CreateForm />} />
        <Route path="/admin/forms/:id/edit" element={<EditForm />} />
        <Route path="/admin/forms/:id/responses" element={<ViewResponses />} />
        <Route path="/admin/applicants" element={<Applicants />} />
        
        <Route path="/apply/:formId" element={<ApplyForm />} />
        <Route path="/apply/:formId/success" element={<SuccessPage />} />
      </Routes>
      <TopNav />
    </BrowserRouter>
  );
}

export default App;
