import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);
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
      paddingTop: '90px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            color: '#2d3436', 
            marginBottom: '8px', 
            fontSize: '32px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
          }}>
            Register
          </h1>
          <p style={{ color: '#636e72', fontSize: '16px', margin: 0 }}>
            Create a new account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fff5f5',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#d63031',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="username" style={{ 
              color: '#2d3436', 
              fontSize: '14px', 
              fontWeight: '500' 
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
                padding: '12px 16px',
                border: '1px solid #dfe6e9',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="email" style={{ 
              color: '#2d3436', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                padding: '12px 16px',
                border: '1px solid #dfe6e9',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="password" style={{ 
              color: '#2d3436', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength="6"
              style={{
                padding: '12px 16px',
                border: '1px solid #dfe6e9',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="confirmPassword" style={{ 
              color: '#2d3436', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength="6"
              style={{
                padding: '12px 16px',
                border: '1px solid #dfe6e9',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#b2bec3' : '#4D7298',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#3d5a78';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#4D7298';
            }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          color: '#636e72', 
          fontSize: '14px' 
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ 
            color: '#4D7298', 
            textDecoration: 'none', 
            fontWeight: '500' 
          }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
