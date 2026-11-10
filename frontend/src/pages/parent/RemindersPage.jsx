import React, { useState, useEffect } from 'react';
import { getRemindersApi, markReminderReadApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Bell, Check, AlertCircle, Info, Mail, MessageSquare } from 'lucide-react';

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReminders = () => {
    setLoading(true);
    getRemindersApi()
      .then((res) => setReminders(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markReminderReadApi(id);
      fetchReminders();
    } catch (err) {
      alert("Failed to mark reminder read: " + err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching in-app reminders..." />;

  return (
    <div className="page-body">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Reminders & Alerts</h1>
        <p className="page-subtitle">In-app notifications for due and upcoming child vaccinations</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Reminders List */}
      <div style={{ marginBottom: '2.5rem' }}>
        {reminders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Bell size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h3>No Reminders Currently Active</h3>
            <p style={{ color: '#64748b' }}>All child vaccinations are up to date with no pending alerts.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reminders.map((rem) => {
              const isOverdue = rem.Message.includes('OVERDUE') || rem.Message.includes('URGENT');
              return (
                <div
                  key={rem.ReminderID}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    backgroundColor: rem.Status === 'Unread' ? '#ffffff' : '#f8fafc',
                    borderLeft: isOverdue ? '5px solid #ef4444' : '5px solid #3b82f6',
                    boxShadow: rem.Status === 'Unread' ? 'var(--shadow-md)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isOverdue ? '#fee2e2' : '#dbeafe', color: isOverdue ? '#ef4444' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isOverdue ? <AlertCircle size={20} /> : <Bell size={20} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: rem.Status === 'Unread' ? 700 : 500, color: '#0f172a' }}>
                        {rem.Message}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Notice Date: {rem.ReminderDate} | Child: <strong>{rem.ChildName}</strong>
                      </div>
                    </div>
                  </div>

                  {rem.Status === 'Unread' ? (
                    <button onClick={() => handleMarkRead(rem.ReminderID)} className="btn btn-outline btn-sm">
                      <Check size={14} /> Mark as Read
                    </button>
                  ) : (
                    <span className="badge badge-completed">Read</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear Future Scope Section for SMS/Email Integration */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0369a1', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
          <Info size={22} /> Future Scope: External Notification Gateway Integration
        </div>
        <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>
          In this academic prototype, reminders are generated dynamically in the database and displayed inside the VaccTrack application portal. For full-scale production deployment, the backend architecture is designed to plug into external communication APIs:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0284c7', fontSize: '0.9rem' }}>
              <MessageSquare size={16} /> Automated SMS Alerts (Twilio / Gupshup)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Sends SMS reminders directly to parent mobile phones 3 days prior to scheduled vaccination date.
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0284c7', fontSize: '0.9rem' }}>
              <Mail size={16} /> Email Digest Notifications (SendGrid / AWS SES)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Delivers monthly vaccination summary bulletins and digital immunization certificate PDFs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;
