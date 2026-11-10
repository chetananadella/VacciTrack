import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getVaccinationsApi, recordVaccinationApi, getChildrenApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ClipboardCheck, CheckCircle2 } from 'lucide-react';

const RecordVaccinationPage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedRecord = searchParams.get('record_id') || '';
  const preSelectedChild = searchParams.get('child_id') || '';

  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(preSelectedChild);
  const [selectedRecordId, setSelectedRecordId] = useState(preSelectedRecord);
  const [vaccinationDate, setVaccinationDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Completed');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getChildrenApi(),
      getVaccinationsApi({ child_id: selectedChild || undefined })
    ])
      .then(([childrenRes, vaccRes]) => {
        setChildrenList(childrenRes.data || []);
        setRecords(vaccRes.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const handleChildSelect = (e) => {
    const childId = e.target.value;
    setSelectedChild(childId);
    setSelectedRecordId('');
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecordId) {
      alert("Please select a vaccination record.");
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await recordVaccinationApi({
        record_id: selectedRecordId,
        vaccination_date: vaccinationDate,
        notes: notes,
        status: status
      });

      if (res.success) {
        alert("Vaccination successfully recorded in database!");
        if (selectedChild) {
          navigate(`/healthcare/children/${selectedChild}`);
        } else {
          navigate('/healthcare/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || "Failed to record vaccination.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading records..." />;

  const activeRecordObj = records.find(r => r.RecordID.toString() === selectedRecordId.toString());

  return (
    <div className="page-body">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1 className="page-title">Record Child Vaccination</h1>
        <p className="page-subtitle">Log administered vaccine dose, clinical notes, and verification details</p>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleRecordSubmit}>
            {/* Child Selection */}
            <div className="form-group">
              <label className="form-label">Step 1: Select Child *</label>
              <select
                className="form-select"
                value={selectedChild}
                onChange={handleChildSelect}
              >
                <option value="">-- All Children --</option>
                {childrenList.map((c) => (
                  <option key={c.ChildID} value={c.ChildID}>
                    {c.ChildName} (Parent: {c.ParentName})
                  </option>
                ))}
              </select>
            </div>

            {/* Record Selection */}
            <div className="form-group">
              <label className="form-label">Step 2: Select Pending Vaccine Record *</label>
              <select
                className="form-select"
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                required
              >
                <option value="">-- Select Scheduled Dose --</option>
                {records.map((r) => (
                  <option key={r.RecordID} value={r.RecordID}>
                    {r.ChildName} – {r.VaccineName} (Dose {r.DoseNumber}) | Scheduled: {r.ScheduledDate} [{r.Status}]
                  </option>
                ))}
              </select>
            </div>

            {activeRecordObj && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, color: '#166534' }}>Selected Dose Information:</div>
                <div>Child: <strong>{activeRecordObj.ChildName}</strong> (DOB: {activeRecordObj.DateOfBirth})</div>
                <div>Vaccine: <strong>{activeRecordObj.VaccineName}</strong> (Dose {activeRecordObj.DoseNumber})</div>
                <div>Scheduled Target Date: <strong>{activeRecordObj.ScheduledDate}</strong></div>
              </div>
            )}

            {/* Vaccination Date */}
            <div className="form-group">
              <label className="form-label">Vaccination Date Administered *</label>
              <input
                type="date"
                className="form-input"
                value={vaccinationDate}
                onChange={(e) => setVaccinationDate(e.target.value)}
                required
              />
            </div>

            {/* Status Select */}
            <div className="form-group">
              <label className="form-label">Vaccination Status *</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="Completed">Completed (Successfully Administered)</option>
                <option value="Missed">Missed / Refused</option>
                <option value="Due">Due / Pending Appointment</option>
              </select>
            </div>

            {/* Clinical Notes */}
            <div className="form-group">
              <label className="form-label">Clinical Notes / Reaction Observations</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Administered 0.5ml IM at left thigh. Patient observed 30 mins, no acute fever."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-teal"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
              disabled={saving}
            >
              <CheckCircle2 size={18} /> {saving ? 'Recording in Database...' : 'Save & Verify Vaccination Record'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecordVaccinationPage;
