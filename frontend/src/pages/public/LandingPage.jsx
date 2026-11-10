import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Syringe, ShieldCheck, Bell, Calendar, Activity, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (email, password, redirectPath) => {
    try {
      await login({ email, password });
      navigate(redirectPath);
    } catch (err) {
      alert("Quick login failed: " + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Demo Quick Bar */}
      <div className="demo-banner">
        <span>🎓 College Review Presentation Mode:</span>
        <button onClick={() => handleQuickDemo('parent@vacctrack.com', 'Parent123!', '/parent/dashboard')} style={{ background: '#ffffff', color: '#1e3a8a', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
          Login as Parent
        </button>
        <button onClick={() => handleQuickDemo('worker@vacctrack.com', 'Worker123!', '/healthcare/dashboard')} style={{ background: '#ffffff', color: '#0d9488', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
          Login as Healthcare Worker
        </button>
        <button onClick={() => handleQuickDemo('admin@vacctrack.com', 'Admin123!', '/admin/dashboard')} style={{ background: '#ffffff', color: '#0f172a', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
          Login as Admin
        </button>
      </div>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0d9488 100%)', color: '#ffffff', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Syringe size={16} color="#14b8a6" /> Smart Child Vaccination Management System
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Never Miss a Lifesaving Vaccine for Your Child
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            VaccTrack provides parents, healthcare workers, and administrators with an automated, reliable digital vaccination tracker, schedule generator, and notification system.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-teal" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Get Started as Parent <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.85rem 2rem', fontSize: '1rem', color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}>
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Core System Capabilities</h2>
          <p style={{ color: '#64748b' }}>Designed for Academic Prototype & Real-World Child Immunization Workflows</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Automated Schedules</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Automatically calculates birth-to-24-month vaccination dates based on standard immunization guidelines upon child registration.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Bell size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Smart Reminders</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              In-app notifications alert parents when vaccinations are due or overdue, ensuring high compliance and zero missed doses.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Healthcare Verification</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Doctors and nurses can search children, log administered vaccines, record clinical notes, and update status instantly.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Role-Based Access</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Strict permission control for Parents, Healthcare Workers, and System Administrators with analytical dashboards.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
