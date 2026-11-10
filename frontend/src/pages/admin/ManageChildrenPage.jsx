import React, { useState, useEffect } from 'react';
import { getChildrenApi, deleteChildApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Baby, Search, Trash2, Phone, Calendar } from 'lucide-react';

const ManageChildrenPage = () => {
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

  const handleDelete = async (id, name) => {
    if (window.confirm(`Admin confirmation: Delete child ${name} and all related immunization records?`)) {
      try {
        await deleteChildApi(id);
        fetchChildren(search);
      } catch (err) {
        alert("Failed to delete child: " + err.message);
      }
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Master Children Directory</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>System-wide directory of all registered children profiles</p>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '380px', width: '100%' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search child, parent, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={16} />
          </button>
        </form>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching master children records..." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Child ID</th>
                <th>Child Name</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Parent Name</th>
                <th>Parent Contact</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {children.map((c) => (
                <tr key={c.ChildID}>
                  <td>#{c.ChildID}</td>
                  <td><strong>{c.ChildName}</strong></td>
                  <td>{c.DateOfBirth}</td>
                  <td>{c.Gender}</td>
                  <td>{c.BloodGroup || '—'}</td>
                  <td>{c.ParentName}</td>
                  <td>
                    <a href={`tel:${c.ParentPhone}`} style={{ color: '#0d9488', fontWeight: 600 }}>
                      {c.ParentPhone}
                    </a>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.Address || '—'}</td>
                  <td>
                    <button onClick={() => handleDelete(c.ChildID, c.ChildName)} className="btn btn-outline btn-sm" style={{ color: '#ef4444' }}>
                      <Trash2 size={14} /> Delete
                    </button>
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

export default ManageChildrenPage;
