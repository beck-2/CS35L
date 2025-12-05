import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '20px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
        }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ 
              color: '#2d3436', 
              marginBottom: '8px', 
              fontSize: '32px',
              fontWeight: '700',
              letterSpacing: '-0.02em',
            }}>
              Login
            </h1>
            <p style={{ color: '#636e72', fontSize: '16px', margin: 0 }}>
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                padding: '14px 18px',
                backgroundColor: '#fff5f5',
                border: '2px solid #fcc',
                borderRadius: '12px',
                color: '#d63031',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                {error}
              </div>
            )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="username" style={{ 
              color: '#2d3436', 
              fontSize: '14px', 
              fontWeight: '600' 
            }}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{
                padding: '14px 18px',
                border: '2px solid #dfe6e9',
                borderRadius: '12px',
                fontSize: '15px',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4D7298';
                e.target.style.boxShadow = '0 0 0 4px rgba(77, 114, 152, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dfe6e9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="password" style={{ 
              color: '#2d3436', 
              fontSize: '14px', 
              fontWeight: '600' 
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                padding: '14px 18px',
                border: '2px solid #dfe6e9',
                borderRadius: '12px',
                fontSize: '15px',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4D7298';
                e.target.style.boxShadow = '0 0 0 4px rgba(77, 114, 152, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dfe6e9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '14px 28px',
              backgroundColor: loading ? '#b2bec3' : '#4D7298',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              transition: 'all 0.3s ease',
              marginTop: '8px',
              boxShadow: loading ? 'none' : '0 2px 8px rgba(77, 114, 152, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#3d5a78';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(77, 114, 152, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#4D7298';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(77, 114, 152, 0.2)';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

          <p style={{ 
            marginTop: '24px', 
            textAlign: 'center', 
            color: '#636e72', 
            fontSize: '14px' 
          }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ 
              color: '#4D7298', 
              textDecoration: 'none', 
              fontWeight: '600' 
            }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
