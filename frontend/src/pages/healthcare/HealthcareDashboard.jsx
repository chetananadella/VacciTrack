import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHealthcareDashboardApi } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Baby, CheckCircle2, Clock, AlertTriangle, ClipboardCheck, Search, Phone } from 'lucide-react';

const HealthcareDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getHealthcareDashboardApi()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading healthcare worker workspace..." />;

  if (error || !data) {
    return (
      <div className="page-body">
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px' }}>
          {error || 'Failed to load dashboard data.'}
        </div>
      </div>
    );
  }

  const { total_children, completed_vaccinations, due_today, upcoming_vaccinations, overdue_vaccinations, action_required_children } = data;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Healthcare Worker Portal</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Clinical workspace for recording and managing child immunizations</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/healthcare/children" className="btn btn-outline">
            <Search size={16} /> Children Directory
          </Link>
          <Link to="/healthcare/record" className="btn btn-teal">
            <ClipboardCheck size={16} /> Record Vaccination
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="card-grid">
        <StatCard title="Total Registered Children" value={total_children} icon={Baby} color="#1e3a8a" subtitle="In central database" />
        <StatCard title="Completed Vaccinations" value={completed_vaccinations} icon={CheckCircle2} color="#10b981" subtitle="Administered doses" />
        <StatCard title="Vaccinations Due Today" value={due_today} icon={Clock} color="#f59e0b" subtitle="Requires action today" />
        <StatCard title="Overdue / Missed" value={overdue_vaccinations} icon={AlertTriangle} color="#ef4444" subtitle="Pending follow-up" />
      </div>

      {/* Immediate Follow-Up Queue Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Priority Follow-Up Queue (Due & Overdue Doses)</h2>
          <Link to="/healthcare/due" style={{ fontSize: '0.875rem', color: '#1e3a8a', fontWeight: 600 }}>
            View All ({action_required_children.length})
          </Link>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Child Name</th>
                <th>Age / DOB</th>
                <th>Parent Name</th>
                <th>Contact Phone</th>
                <th>Pending Vaccine</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {action_required_children.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    No pending due or overdue vaccinations found.
                  </td>
                </tr>
              ) : (
                action_required_children.map((item) => (
                  <tr key={item.RecordID}>
                    <td><strong>{item.ChildName}</strong></td>
                    <td>{item.DateOfBirth}</td>
                    <td>{item.ParentName}</td>
                    <td>
                      <a href={`tel:${item.ParentPhone}`} style={{ color: '#0d9488', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={13} /> {item.ParentPhone}
                      </a>
                    </td>
                    <td><strong>{item.VaccineName}</strong> (Dose {item.DoseNumber})</td>
                    <td>{item.ScheduledDate}</td>
                    <td><StatusBadge status={item.Status} /></td>
                    <td>
                      <Link to={`/healthcare/record?record_id=${item.RecordID}`} className="btn btn-teal btn-sm">
                        Record Dose
                      </Link>
                    </td>
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

export default HealthcareDashboard;
