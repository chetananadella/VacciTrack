import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChildrenApi, deleteChildApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Baby, PlusCircle, Calendar, Trash2, Eye, MapPin } from 'lucide-react';

const MyChildrenPage = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChildren = () => {
    setLoading(true);
    getChildrenApi()
      .then((res) => setChildren(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleDelete = async (childId, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}'s profile and records?`)) {
      try {
        await deleteChildApi(childId);
        fetchChildren();
      } catch (err) {
        alert("Failed to delete child: " + err.message);
      }
    }
  };

  if (loading) return <LoadingSpinner text="Fetching children profiles..." />;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Children</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Manage child profiles and view immunization records</p>
        </div>
        <Link to="/parent/add-child" className="btn btn-primary">
          <PlusCircle size={18} /> Register New Child
        </Link>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {children.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Baby size={56} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>No Children Registered</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Click below to register your child and generate an automated vaccination plan.</p>
          <Link to="/parent/add-child" className="btn btn-primary">
            <PlusCircle size={18} /> Add Your Child
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {children.map((child) => (
            <div key={child.ChildID} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#dbeafe', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Baby size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{child.ChildName}</h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: #{child.ChildID}</span>
                    </div>
                  </div>
                  <span className="badge badge-completed">{child.Gender}</span>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                  <div>📅 <strong>Date of Birth:</strong> {child.DateOfBirth}</div>
                  <div>🩸 <strong>Blood Group:</strong> {child.BloodGroup || 'Not specified'}</div>
                  {child.Address && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <MapPin size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{child.Address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <Link to={`/parent/children/${child.ChildID}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                  <Eye size={14} /> Profile
                </Link>
                <Link to={`/parent/schedule?child=${child.ChildID}`} className="btn btn-primary btn-sm" style={{ flex: 1.5 }}>
                  <Calendar size={14} /> Schedule
                </Link>
                <button onClick={() => handleDelete(child.ChildID, child.ChildName)} className="btn btn-outline btn-sm" style={{ color: '#ef4444' }} title="Delete profile">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChildrenPage;
