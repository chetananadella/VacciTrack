import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChildrenApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Eye, Phone, Baby, ClipboardCheck } from 'lucide-react';

const ChildrenListPage = () => {
  const [children, setChildren] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChildren = (query = '') => {
    setLoading(true);
    getChildrenApi(query)
      .then((res) => setChildren(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchChildren(search);
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Children Directory</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Search child profiles by name, parent name, or contact number</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '380px', width: '100%' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search child or parent name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Searching children directory..." />
      ) : children.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Baby size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Children Matching Search</h3>
          <p style={{ color: '#64748b' }}>Try adjusting your search filter.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Child ID</th>
                <th>Child Name</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Parent Name</th>
                <th>Parent Contact</th>
                <th>Blood Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr key={child.ChildID}>
                  <td>#{child.ChildID}</td>
                  <td><strong>{child.ChildName}</strong></td>
                  <td>{child.Gender}</td>
                  <td>{child.DateOfBirth}</td>
                  <td>{child.ParentName}</td>
                  <td>
                    <a href={`tel:${child.ParentPhone}`} style={{ color: '#0d9488', fontWeight: 600 }}>
                      <Phone size={12} /> {child.ParentPhone}
                    </a>
                  </td>
                  <td>{child.BloodGroup || '—'}</td>
                  <td style={{ display: 'flex', gap: '0.35rem' }}>
                    <Link to={`/healthcare/children/${child.ChildID}`} className="btn btn-outline btn-sm">
                      <Eye size={14} /> Profile
                    </Link>
                    <Link to={`/healthcare/record?child_id=${child.ChildID}`} className="btn btn-teal btn-sm">
                      <ClipboardCheck size={14} /> Record Dose
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChildrenListPage;
