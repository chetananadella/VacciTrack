import React, { useState, useEffect } from 'react';
import { getVaccinationsApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Filter, Calendar } from 'lucide-react';

const VaccinationRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecords = () => {
    setLoading(true);
    getVaccinationsApi({ status: statusFilter, search: search })
      .then((res) => setRecords(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Master Vaccination Records</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>System audit log of all scheduled, completed, and overdue child doses</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search child, vaccine, or parent name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-outline">
            <Search size={16} />
          </button>
        </form>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Due">Due Today</option>
          <option value="Missed">Missed / Overdue</option>
        </select>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching master vaccination logs..." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Child Name</th>
                <th>Parent Name</th>
                <th>Vaccine Name</th>
                <th>Dose</th>
                <th>Scheduled Date</th>
                <th>Administered Date</th>
                <th>Status</th>
                <th>Doctor / Specialist</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.RecordID}>
                  <td>#{r.RecordID}</td>
                  <td><strong>{r.ChildName}</strong></td>
                  <td>{r.ParentName}</td>
                  <td>{r.VaccineName}</td>
                  <td>Dose {r.DoseNumber}</td>
                  <td>{r.ScheduledDate}</td>
                  <td>{r.VaccinationDate || '—'}</td>
                  <td><StatusBadge status={r.Status} /></td>
                  <td>{r.AdministeredBy || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.Notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VaccinationRecordsPage;
