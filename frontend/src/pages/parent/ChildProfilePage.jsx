import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChildDetailsApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Baby, Calendar, CheckCircle2, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

const ChildProfilePage = () => {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getChildDetailsApi(id)
      .then((res) => setChild(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading child profile..." />;

  if (error || !child) {
    return (
      <div className="page-body">
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px' }}>
          {error || 'Child profile not found.'}
        </div>
      </div>
    );
  }

  const { stats } = child;

  return (
    <div className="page-body">
      <Link to="/parent/children" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#1e3a8a', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back to Children List
      </Link>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#dbeafe', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Baby size={36} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{child.ChildName}</h1>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Parent: <strong>{child.ParentName}</strong> | DOB: <strong>{child.DateOfBirth}</strong> | Gender: <strong>{child.Gender}</strong>
              </div>
            </div>
          </div>
          <Link to={`/parent/schedule?child=${child.ChildID}`} className="btn btn-primary">
            View Complete Schedule
          </Link>
        </div>
      </div>

      {/* Immunization Progress Breakdown */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Vaccination Progress Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>COMPLETED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{stats?.completed || 0}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>UPCOMING</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{stats?.upcoming || 0}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>DUE TODAY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.due || 0}</div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>OVERDUE / MISSED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{stats?.missed || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildProfilePage;
