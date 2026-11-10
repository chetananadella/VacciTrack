import React, { useState, useEffect } from 'react';
import { getUsersApi, createUserApi, updateUserApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, UserPlus, Search, Shield, Stethoscope, HeartHandshake } from 'lucide-react';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New User Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HealthcareWorker');
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsersApi({ role: roleFilter, search: search })
      .then((res) => setUsers(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createUserApi({
        full_name: fullName,
        email: email,
        phone: phone,
        password: password,
        role: role
      });
      alert(`New ${role} account created successfully!`);
      setShowModal(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      alert("Failed to create user: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId, currentFullName, currentPhone, newRole) => {
    try {
      await updateUserApi(userId, {
        full_name: currentFullName,
        phone: currentPhone,
        role: newRole
      });
      fetchUsers();
    } catch (err) {
      alert("Failed to update role: " + err.message);
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>View and manage Parents, Healthcare Workers, and System Administrators</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <UserPlus size={16} /> Create User Account
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, or phone..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All User Roles</option>
          <option value="Parent">Parent</option>
          <option value="HealthcareWorker">Healthcare Worker</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching user list..." />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.UserID}>
                  <td>#{u.UserID}</td>
                  <td><strong>{u.FullName}</strong></td>
                  <td>{u.Email}</td>
                  <td>{u.Phone || '—'}</td>
                  <td>
                    <span className="badge badge-completed" style={{ backgroundColor: u.Role === 'Admin' ? '#dbeafe' : u.Role === 'HealthcareWorker' ? '#ccfbf1' : '#f1f5f9', color: u.Role === 'Admin' ? '#1e3a8a' : u.Role === 'HealthcareWorker' ? '#0d9488' : '#334155' }}>
                      {u.Role}
                    </span>
                  </td>
                  <td>{u.CreatedAt ? u.CreatedAt.substring(0, 10) : '—'}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                      value={u.Role}
                      onChange={(e) => handleRoleChange(u.UserID, u.FullName, u.Phone, e.target.value)}
                    >
                      <option value="Parent">Parent</option>
                      <option value="HealthcareWorker">Healthcare Worker</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Create User Account</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign Role *</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="HealthcareWorker">Healthcare Worker</option>
                  <option value="Parent">Parent</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
