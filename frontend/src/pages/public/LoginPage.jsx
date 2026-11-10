import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Key, Mail, Shield, Stethoscope, HeartHandshake } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({ email, password });
      const userRole = res.data.user.role || res.data.user.Role;
      if (userRole === 'Parent') navigate('/parent/dashboard');
      else if (userRole === 'HealthcareWorker') navigate('/healthcare/dashboard');
      else if (userRole === 'Admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (dEmail, dPassword) => {
    setEmail(dEmail);
    setPassword(dPassword);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Sign In to VaccTrack</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Access Parent, Healthcare Worker, or Admin Portal
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@vacctrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Login Buttons */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
            🎓 Demo Credentials Quick-Fill
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemoCredentials('parent@vacctrack.com', 'Parent123!')}
              style={{ justifyContent: 'flex-start' }}
            >
              <HeartHandshake size={14} color="#10b981" /> Parent: parent@vacctrack.com
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemoCredentials('worker@vacctrack.com', 'Worker123!')}
              style={{ justifyContent: 'flex-start' }}
            >
              <Stethoscope size={14} color="#0d9488" /> Healthcare Worker: worker@vacctrack.com
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemoCredentials('admin@vacctrack.com', 'Admin123!')}
              style={{ justifyContent: 'flex-start' }}
            >
              <Shield size={14} color="#3b82f6" /> Admin: admin@vacctrack.com
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          Don't have an account? <Link to="/register" style={{ color: '#1e3a8a', fontWeight: 700 }}>Register Parent</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
