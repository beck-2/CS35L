import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Calendar, User } from 'lucide-react';

function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on public application routes
  if (location.pathname.startsWith('/apply/')) {
    return null;
  }

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    if (path === '/admin/dashboard') {
      return location.pathname.startsWith('/admin/forms') || location.pathname === '/admin/dashboard';
    }
    if (path === '/admin/applicants') {
      return location.pathname.startsWith('/admin/applicants') || location.pathname.includes('/responses');
    }
    return false;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '12px 0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        zIndex: 1000,
        height: '60px',
      }}
    >
      <button
        onClick={() => navigate('/admin/dashboard')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          color: isActive('/admin/dashboard') ? '#4D7298' : '#666',
          fontWeight: isActive('/admin/dashboard') ? '600' : '400',
        }}
      >
        <FileText size={20} strokeWidth={isActive('/admin/dashboard') ? 2.5 : 2} />
        <span style={{ fontSize: '11px', lineHeight: '1' }}>Forms</span>
      </button>
      <button
        onClick={() => navigate('/admin')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          color: isActive('/admin') ? '#4D7298' : '#666',
          fontWeight: isActive('/admin') ? '600' : '400',
        }}
      >
        <Calendar size={20} strokeWidth={isActive('/admin') ? 2.5 : 2} />
        <span style={{ fontSize: '11px', lineHeight: '1' }}>Timeline</span>
      </button>
      <button
        onClick={() => navigate('/admin/applicants')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          color: isActive('/admin/applicants') ? '#4D7298' : '#666',
          fontWeight: isActive('/admin/applicants') ? '600' : '400',
        }}
      >
        <User size={20} strokeWidth={isActive('/admin/applicants') ? 2.5 : 2} />
        <span style={{ fontSize: '11px', lineHeight: '1' }}>Applicants</span>
      </button>
    </div>
  );
}

export default TopNav;

