import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getChildrenApi, getChildScheduleApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, Filter, Baby } from 'lucide-react';

const VaccinationSchedulePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const childParam = searchParams.get('child') || '';

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(childParam);
  const [schedule, setSchedule] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getChildrenApi()
      .then((res) => {
        const list = res.data || [];
        setChildren(list);
        if (list.length > 0 && !selectedChild) {
          setSelectedChild(list[0].ChildID.toString());
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (selectedChild) {
      setLoading(true);
      getChildScheduleApi(selectedChild)
        .then((res) => setSchedule(res.data || []))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [selectedChild]);

  const handleChildChange = (e) => {
    const val = e.target.value;
    setSelectedChild(val);
    setSearchParams({ child: val });
  };

  const filteredSchedule = schedule.filter((item) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Overdue') return item.Status === 'Missed' || item.Status === 'Due';
    return item.Status === statusFilter;
  });

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Child Vaccination Schedule</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Official immunization timeline and dose records</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Select Child */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Child:</label>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedChild}
              onChange={handleChildChange}
            >
              {children.map((c) => (
                <option key={c.ChildID} value={c.ChildID}>
                  {c.ChildName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#64748b" />
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Due">Due Today</option>
              <option value="Overdue">Overdue / Missed</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching vaccination timeline..." />
      ) : schedule.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Schedule Available</h3>
          <p style={{ color: '#64748b' }}>Please select a registered child profile.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vaccine Name</th>
                <th>Dose</th>
                <th>Recommended Age</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Administered Date</th>
                <th>Healthcare Provider</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((item) => (
                <tr key={item.RecordID}>
                  <td>
                    <strong>{item.VaccineName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.Description}</div>
                  </td>
                  <td>Dose {item.DoseNumber}</td>
                  <td><span className="badge badge-upcoming">{item.RecommendedAgeLabel}</span></td>
                  <td><strong>{item.ScheduledDate}</strong></td>
                  <td><StatusBadge status={item.Status} /></td>
                  <td>{item.VaccinationDate || '—'}</td>
                  <td>{item.AdministeredBy || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.Notes || 'No notes'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VaccinationSchedulePage;
