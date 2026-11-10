import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRemindersApi } from '../services/api';
import { Syringe, Bell, LogOut, User, Shield, Stethoscope, HeartHandshake } from 'lucide-react';

const Navbar = () => {
  const { user, logout, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && role === 'Parent') {
      getRemindersApi()
        .then(res => {
          if (res.data) {
            const unread = res.data.filter(r => r.Status === 'Unread').length;
            setUnreadCount(unread);
          }
        })
        .catch(err => console.error("Error fetching reminders count:", err));
    }
  }, [isAuthenticated, role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    if (role === 'Admin') return <Shield size={16} color="#3b82f6" />;
    if (role === 'HealthcareWorker') return <Stethoscope size={16} color="#0d9488" />;
    return <HeartHandshake size={16} color="#10b981" />;
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Logo & Name */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
          }}
        >
          <Syringe size={22} />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Vacc<span style={{ color: '#0d9488' }}>Track</span>
          </span>
          <span style={{ fontSize: '0.7rem', display: 'block', color: '#64748b', fontWeight: 500, marginTop: '-3px' }}>
            Child Vaccination System
          </span>
        </div>
      </Link>

      {/* Right side controls */}
      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {role === 'Parent' && (
            <Link
              to="/parent/reminders"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#475569',
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.35rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {getRoleIcon()}
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                {user?.full_name || user?.FullName || 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>
                {role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            title="Sign out"
            style={{ gap: '0.35rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-outline btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Register Parent
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
