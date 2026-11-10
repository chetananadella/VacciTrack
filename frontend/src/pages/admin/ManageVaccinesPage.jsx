import React, { useState, useEffect } from 'react';
import { getVaccinesApi, addVaccineApi, updateVaccineApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Syringe, PlusCircle, Edit } from 'lucide-react';

const ManageVaccinesPage = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);

  // Form fields
  const [vaccineName, setVaccineName] = useState('');
  const [description, setDescription] = useState('');
  const [doseNumber, setDoseNumber] = useState(1);
  const [recommendedAgeDays, setRecommendedAgeDays] = useState(0);
  const [recommendedAgeLabel, setRecommendedAgeLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchVaccines = () => {
    setLoading(true);
    getVaccinesApi()
      .then((res) => setVaccines(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  const openAddModal = () => {
    setEditingVaccine(null);
    setVaccineName('');
    setDescription('');
    setDoseNumber(1);
    setRecommendedAgeDays(0);
    setRecommendedAgeLabel('');
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setEditingVaccine(v);
    setVaccineName(v.VaccineName);
    setDescription(v.Description || '');
    setDoseNumber(v.DoseNumber);
    setRecommendedAgeDays(v.RecommendedAgeInDays);
    setRecommendedAgeLabel(v.RecommendedAgeLabel);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      vaccine_name: vaccineName,
      description: description,
      dose_number: parseInt(doseNumber),
      recommended_age_in_days: parseInt(recommendedAgeDays),
      recommended_age_label: recommendedAgeLabel
    };

    try {
      if (editingVaccine) {
        await updateVaccineApi(editingVaccine.VaccineID, payload);
        alert("Vaccine updated successfully!");
      } else {
        await addVaccineApi(payload);
        alert("New vaccine added to master schedule!");
      }
      setShowModal(false);
      fetchVaccines();
    } catch (err) {
      alert("Error saving vaccine: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Manage Master Vaccine Catalog</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Configure default childhood immunization schedules and dose parameters</p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <PlusCircle size={16} /> Add New Vaccine Type
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading vaccine master catalog..." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vaccine ID</th>
                <th>Vaccine Name</th>
                <th>Description</th>
                <th>Dose Number</th>
                <th>Target Age Label</th>
                <th>Age Interval (Days)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.map((v) => (
                <tr key={v.VaccineID}>
                  <td>#{v.VaccineID}</td>
                  <td><strong>{v.VaccineName}</strong></td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.Description}</td>
                  <td>Dose {v.DoseNumber}</td>
                  <td><span className="badge badge-upcoming">{v.RecommendedAgeLabel}</span></td>
                  <td>{v.RecommendedAgeInDays} Days</td>
                  <td>
                    <button onClick={() => openEditModal(v)} className="btn btn-outline btn-sm">
                      <Edit size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Vaccine Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              {editingVaccine ? 'Edit Vaccine Parameters' : 'Add New Vaccine to Schedule'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Vaccine Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hepatitis B-2"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Disease prevention details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Dose Number *</label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    value={doseNumber}
                    onChange={(e) => setDoseNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Recommended Age Days *</label>
                  <input
                    type="number"
                    className="form-input"
                    min={0}
                    placeholder="e.g. 42 for 6 weeks"
                    value={recommendedAgeDays}
                    onChange={(e) => setRecommendedAgeDays(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Recommended Age Display Label *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 6 Weeks, 9 Months, At Birth"
                  value={recommendedAgeLabel}
                  onChange={(e) => setRecommendedAgeLabel(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Vaccine Definition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVaccinesPage;
