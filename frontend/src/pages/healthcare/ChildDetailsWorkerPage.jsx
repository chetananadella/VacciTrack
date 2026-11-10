import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChildDetailsApi, getChildScheduleApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Baby, ArrowLeft, ClipboardCheck, Phone, Mail } from 'lucide-react';

const ChildDetailsWorkerPage = () => {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getChildDetailsApi(id), getChildScheduleApi(id)])
      .then(([childRes, scheduleRes]) => {
        setChild(childRes.data);
        setSchedule(scheduleRes.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading child healthcare records..." />;

  if (error || !child) {
    return (
      <div className="page-body">
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px' }}>
          {error || 'Child record not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <Link to="/healthcare/children" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#1e3a8a', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back to Children Directory
      </Link>

      {/* Child Information Header */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Baby size={36} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{child.ChildName}</h1>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
                DOB: <strong>{child.DateOfBirth}</strong> | Gender: <strong>{child.Gender}</strong> | Blood Group: <strong>{child.BloodGroup || 'N/A'}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem', display: 'flex', gap: '1rem' }}>
                <span>👤 Parent: <strong>{child.ParentName}</strong></span>
                <span><Phone size={13} color="#0d9488" /> {child.ParentPhone}</span>
                <span><Mail size={13} color="#64748b" /> {child.ParentEmail}</span>
              </div>
            </div>
          </div>

          <Link to={`/healthcare/record?child_id=${child.ChildID}`} className="btn btn-teal">
            <ClipboardCheck size={18} /> Record New Vaccination
          </Link>
        </div>
      </div>

      {/* Vaccine Timeline Table */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Immunization Schedule & Clinical Logs</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vaccine Name</th>
                <th>Dose</th>
                <th>Recommended Age</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Vaccination Date</th>
                <th>Administered By</th>
                <th>Clinical Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
                <tr key={item.RecordID}>
                  <td><strong>{item.VaccineName}</strong></td>
                  <td>Dose {item.DoseNumber}</td>
                  <td><span className="badge badge-upcoming">{item.RecommendedAgeLabel}</span></td>
                  <td>{item.ScheduledDate}</td>
                  <td><StatusBadge status={item.Status} /></td>
                  <td>{item.VaccinationDate || '—'}</td>
                  <td>{item.AdministeredBy || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.Notes || 'No notes'}</td>
                  <td>
                    <Link to={`/healthcare/record?record_id=${item.RecordID}`} className="btn btn-outline btn-sm">
                      Edit Record
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChildDetailsWorkerPage;
