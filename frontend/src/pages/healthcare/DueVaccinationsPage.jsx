import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVaccinationsApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { AlertCircle, Phone, ClipboardCheck } from 'lucide-react';

const DueVaccinationsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getVaccinationsApi({ status: 'overdue' })
      .then((res) => setRecords(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Fetching due and overdue vaccination list..." />;

  return (
    <div className="page-body">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Due & Overdue Vaccinations</h1>
        <p className="page-subtitle">Children requiring immediate clinical intervention and follow-up</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <AlertCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h3>All Immunizations Are Up to Date!</h3>
          <p style={{ color: '#64748b' }}>No children are currently overdue for scheduled doses.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Child Name</th>
                <th>Parent Name</th>
                <th>Parent Contact</th>
                <th>Vaccine Name</th>
                <th>Dose</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.RecordID}>
                  <td><strong>{r.ChildName}</strong></td>
                  <td>{r.ParentName}</td>
                  <td>
                    <a href={`tel:${r.ParentPhone}`} style={{ color: '#0d9488', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Phone size={13} /> {r.ParentPhone}
                    </a>
                  </td>
                  <td><strong>{r.VaccineName}</strong></td>
                  <td>Dose {r.DoseNumber}</td>
                  <td><strong style={{ color: '#ef4444' }}>{r.ScheduledDate}</strong></td>
                  <td><StatusBadge status={r.Status} /></td>
                  <td>
                    <Link to={`/healthcare/record?record_id=${r.RecordID}`} className="btn btn-teal btn-sm">
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

export default DueVaccinationsPage;
