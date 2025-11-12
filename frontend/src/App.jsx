import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import CreateForm from './pages/CreateForm';
import EditForm from './pages/EditForm';
import ViewResponses from './pages/ViewResponses';
import ApplyForm from './pages/ApplyForm';
import SuccessPage from './pages/SuccessPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/forms/new" element={<CreateForm />} />
        <Route path="/admin/forms/:id/edit" element={<EditForm />} />
        <Route path="/admin/forms/:id/responses" element={<ViewResponses />} />
        
        <Route path="/apply/:formId" element={<ApplyForm />} />
        <Route path="/apply/:formId/success" element={<SuccessPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
