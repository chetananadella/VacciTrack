import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addChildApi } from '../../services/api';
import { Baby, PlusCircle, Calendar, User, MapPin } from 'lucide-react';

const AddChildPage = () => {
  const navigate = useNavigate();

  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await addChildApi({
        child_name: childName,
        date_of_birth: dateOfBirth,
        gender: gender,
        blood_group: bloodGroup,
        address: address
      });

      if (res.success) {
        alert(`Child profile for ${childName} created! Vaccination schedule automatically generated.`);
        navigate('/parent/children');
      }
    } catch (err) {
      setError(err.message || 'Failed to add child.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1 className="page-title">Register New Child</h1>
        <p className="page-subtitle">Enter child details to automatically compute recommended vaccination dates</p>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Child Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Aarav Sharma"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Home Address</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Street address, City, Pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/parent/children')}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1.5 }}
                disabled={loading}
              >
                {loading ? 'Creating Profile...' : 'Save & Generate Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChildPage;
