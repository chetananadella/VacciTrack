import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardApi } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Baby, Users, Syringe, CheckCircle2, Clock, AlertTriangle, ShieldCheck, FileSpreadsheet } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDashboardApi()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin analytics dashboard..." />;

  if (error || !data) {
    return (
      <div className="page-body">
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px' }}>
          {error || 'Failed to load admin analytics.'}
        </div>
      </div>
    );
  }

  const { cards, status_distribution, vaccine_coverage, recent_activity } = data;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Admin Command Dashboard</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>System-wide vaccination statistics, user control, and coverage analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/reports" className="btn btn-primary">
            <FileSpreadsheet size={16} /> Reports & Analytics
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="card-grid">
        <StatCard title="Total Children" value={cards.total_children} icon={Baby} color="#1e3a8a" subtitle="Registered profiles" />
        <StatCard title="Total Vaccinations" value={cards.total_vaccinations} icon={Syringe} color="#0d9488" subtitle="System records" />
        <StatCard title="Completed Doses" value={cards.completed} icon={CheckCircle2} color="#10b981" subtitle="Administered" />
        <StatCard title="Upcoming Doses" value={cards.upcoming} icon={Clock} color="#3b82f6" subtitle="Scheduled" />
        <StatCard title="Overdue Doses" value={cards.overdue} icon={AlertTriangle} color="#ef4444" subtitle="Action required" />
        <StatCard title="Total Parents" value={cards.parents} icon={Users} color="#6366f1" subtitle="Active parent accounts" />
        <StatCard title="Healthcare Workers" value={cards.healthcare_workers} icon={ShieldCheck} color="#0f766e" subtitle="Verified clinical staff" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Status Distribution Pie Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Vaccination Status Distribution
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Vaccine Coverage Bar Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Vaccine Type Coverage Breakdown
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vaccine_coverage.slice(0, 7)}>
                <XAxis dataKey="VaccineName" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="CompletedCount" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="OverdueCount" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent System Activity Table */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Recent Activity Logs</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Child Name</th>
                <th>Parent Name</th>
                <th>Vaccine Name</th>
                <th>Scheduled Date</th>
                <th>Vaccination Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent_activity.map((item) => (
                <tr key={item.RecordID}>
                  <td>#{item.RecordID}</td>
                  <td><strong>{item.ChildName}</strong></td>
                  <td>{item.ParentName}</td>
                  <td>{item.VaccineName}</td>
                  <td>{item.ScheduledDate}</td>
                  <td>{item.VaccinationDate || '—'}</td>
                  <td><StatusBadge status={item.Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
