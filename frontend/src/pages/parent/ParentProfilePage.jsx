import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, ShieldCheck, HeartHandshake } from 'lucide-react';

const ParentProfilePage = () => {
  const { user, role } = useAuth();

  return (
    <div className="page-body">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="page-title">My Account Profile</h1>
        <p className="page-subtitle">Personal account information and contact details</p>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>{user?.full_name || user?.FullName}</h2>
              <span className="badge badge-completed" style={{ marginTop: '0.25rem' }}>
                <HeartHandshake size={12} /> Registered {role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Mail size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{user?.email || user?.Email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Phone size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{user?.phone || user?.Phone || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ShieldCheck size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>User Role & Permissions</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentProfilePage;
