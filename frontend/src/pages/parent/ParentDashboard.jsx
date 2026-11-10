import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getParentDashboardApi } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Baby, CheckCircle2, Clock, AlertTriangle, Calendar, PlusCircle, ArrowRight } from 'lucide-react';

const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getParentDashboardApi()
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading your parent dashboard..." />;

  if (error) {
    return (
      <div className="page-body">
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px' }}>
          Failed to load dashboard: {error}
        </div>
      </div>
    );
  }

  const { total_children, completed_vaccines, upcoming_vaccines, overdue_vaccines, next_vaccination, recent_history, children } = data;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Parent Dashboard</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Overview of your children's vaccination progress</p>
        </div>
        <Link to="/parent/add-child" className="btn btn-primary">
          <PlusCircle size={18} /> Add New Child
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="card-grid">
        <StatCard title="Registered Children" value={total_children} icon={Baby} color="#1e3a8a" subtitle="Children linked to account" />
        <StatCard title="Completed Vaccines" value={completed_vaccines} icon={CheckCircle2} color="#10b981" subtitle="Doses successfully administered" />
        <StatCard title="Upcoming Vaccines" value={upcoming_vaccines} icon={Clock} color="#3b82f6" subtitle="Scheduled future doses" />
        <StatCard title="Overdue / Due" value={overdue_vaccines} icon={AlertTriangle} color="#ef4444" subtitle="Action required doses" />
      </div>

      {/* Next Vaccination Highlight Banner */}
      {next_vaccination && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={28} color="#14b8a6" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 600 }}>
                Next Scheduled Vaccination
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {next_vaccination.ChildName} – {next_vaccination.VaccineName} (Dose {next_vaccination.DoseNumber})
              </div>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '0.1rem' }}>
                Scheduled Date: <strong>{next_vaccination.ScheduledDate}</strong>
              </div>
            </div>
          </div>
          <Link to={`/parent/schedule?child=${next_vaccination.ChildID}`} className="btn btn-teal">
            View Schedule <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Children Overview Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>My Children Profile Cards</h2>
        {children.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Baby size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No Children Added Yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Add your child to generate their official immunization schedule automatically.</p>
            <Link to="/parent/add-child" className="btn btn-primary">
              <PlusCircle size={18} /> Add Your Child
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {children.map((child) => (
              <div key={child.ChildID} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{child.ChildName}</h3>
                    <span className="badge badge-upcoming">{child.Gender}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>🎂 DOB: <strong>{child.DateOfBirth}</strong></div>
                    <div>🩸 Blood Group: <strong>{child.BloodGroup || 'N/A'}</strong></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <Link to={`/parent/children/${child.ChildID}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                    Profile Details
                  </Link>
                  <Link to={`/parent/schedule?child=${child.ChildID}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    View Schedule
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Vaccination History Table */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Recent Vaccination Activity</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Child Name</th>
                <th>Vaccine</th>
                <th>Scheduled Date</th>
                <th>Administered Date</th>
                <th>Status</th>
                <th>Doctor / Clinic</th>
              </tr>
            </thead>
            <tbody>
              {recent_history.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    No recent vaccination records found.
                  </td>
                </tr>
              ) : (
                recent_history.map((item) => (
                  <tr key={item.RecordID}>
                    <td><strong>{item.ChildName}</strong></td>
                    <td>{item.VaccineName}</td>
                    <td>{item.ScheduledDate}</td>
                    <td>{item.VaccinationDate || '—'}</td>
                    <td><StatusBadge status={item.Status} /></td>
                    <td>{item.DoctorName || 'Pending'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
