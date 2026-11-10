import React, { useState, useEffect } from 'react';
import { getVaccinationsApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CheckCircle2, History } from 'lucide-react';

const VaccinationHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getVaccinationsApi({ status: 'Completed' })
      .then((res) => setHistory(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading completed vaccination history..." />;

  return (
    <div className="page-body">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Vaccination History</h1>
        <p className="page-subtitle">Verified records of doses administered to your children</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <History size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Completed Vaccinations Recorded Yet</h3>
          <p style={{ color: '#64748b' }}>Once a healthcare provider records a vaccination, it will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Child Name</th>
                <th>Vaccine Name</th>
                <th>Dose</th>
                <th>Scheduled Date</th>
                <th>Administered Date</th>
                <th>Doctor / Clinic</th>
                <th>Clinical Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.RecordID}>
                  <td><strong>{item.ChildName}</strong></td>
                  <td>{item.VaccineName}</td>
                  <td>Dose {item.DoseNumber}</td>
                  <td>{item.ScheduledDate}</td>
                  <td><strong style={{ color: '#10b981' }}>{item.VaccinationDate}</strong></td>
                  <td>{item.AdministeredBy || 'Clinic Specialist'}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.Notes || 'Normal reaction'}</td>
                  <td><StatusBadge status="Completed" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VaccinationHistoryPage;
