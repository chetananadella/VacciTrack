import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Baby, 
  PlusCircle, 
  CalendarCheck, 
  History, 
  Bell, 
  User, 
  Search, 
  ClipboardCheck, 
  AlertCircle, 
  Users, 
  Syringe, 
  BarChart3, 
  FileSpreadsheet 
} from 'lucide-react';

const Sidebar = () => {
  const { role } = useAuth();

  const getParentLinks = () => [
    { to: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/parent/children', label: 'My Children', icon: Baby },
    { to: '/parent/add-child', label: 'Add Child', icon: PlusCircle },
    { to: '/parent/schedule', label: 'Vaccine Schedule', icon: CalendarCheck },
    { to: '/parent/history', label: 'Vaccination History', icon: History },
    { to: '/parent/reminders', label: 'Reminders & Alerts', icon: Bell },
    { to: '/parent/profile', label: 'My Profile', icon: User },
  ];

  const getHealthcareLinks = () => [
    { to: '/healthcare/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/healthcare/children', label: 'Children Directory', icon: Search },
    { to: '/healthcare/due', label: 'Due / Overdue List', icon: AlertCircle },
    { to: '/healthcare/record', label: 'Record Vaccination', icon: ClipboardCheck },
  ];

  const getAdminLinks = () => [
    { to: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/children', label: 'Manage Children', icon: Baby },
    { to: '/admin/vaccines', label: 'Manage Vaccine Types', icon: Syringe },
    { to: '/admin/records', label: 'All Vaccination Records', icon: CalendarCheck },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const links = 
    role === 'Parent' ? getParentLinks() :
    role === 'HealthcareWorker' ? getHealthcareLinks() :
    role === 'Admin' ? getAdminLinks() : [];

  if (!links.length) return null;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flexShrink: 0,
        minHeight: 'calc(100vh - 64px)'
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.75rem 0.5rem 0.75rem' }}>
        {role === 'Parent' ? 'Parent Portal' : role === 'HealthcareWorker' ? 'Healthcare Portal' : 'Admin Portal'}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#1e3a8a' : 'transparent',
                transition: 'all 0.2s ease-in-out',
                textDecoration: 'none'
              })}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* College Project Tag */}
      <div style={{ marginTop: 'auto', padding: '1rem 0.75rem', borderTop: '1px solid #1e293b', fontSize: '0.75rem', color: '#64748b' }}>
        <div style={{ fontWeight: 600, color: '#cbd5e1' }}>VACCTrack Academic Prototype</div>
        <div>Community Service Project</div>
      </div>
    </aside>
  );
};

export default Sidebar;
