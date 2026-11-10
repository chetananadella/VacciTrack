import React, { useState, useEffect } from 'react';
import { getAnalyticsReportApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FileSpreadsheet, Printer, Download, Syringe, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

const ReportsAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalyticsReportApi()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner text="Generating statistical analytics report..." />;

  if (error || !data) {
    return (
      <div className="page-body">
        <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px' }}>
          {error || 'Failed to generate report.'}
        </div>
      </div>
    );
  }

  const { cards, vaccine_coverage } = data;
  const coverageRate = cards.total_vaccinations > 0 ? ((cards.completed / cards.total_vaccinations) * 100).toFixed(1) : '0';

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Vaccination Analytics & Coverage Report</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Official Immunization Compliance & System Summary</p>
        </div>

        <button onClick={handlePrint} className="btn btn-outline">
          <Printer size={16} /> Print / Export Report
        </button>
      </div>

      {/* High level executive summary card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: '#ffffff', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Immunization Program KPI Summary</h2>
        <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
          Real-time performance indicators computed from Microsoft SQL Server database.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>OVERALL COVERAGE RATE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#14b8a6' }}>{coverageRate}%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>TOTAL CHILDREN</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{cards.total_children}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>COMPLETED DOSES</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{cards.completed}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>MISSED / OVERDUE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{cards.overdue}</div>
          </div>
        </div>
      </div>

      {/* Detailed Vaccine Type Breakdown Table */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Vaccine Type Coverage & Compliance Breakdown</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vaccine Name</th>
                <th>Total Assigned Records</th>
                <th>Administered (Completed)</th>
                <th>Overdue / Pending</th>
                <th>Compliance Percentage</th>
              </tr>
            </thead>
            <tbody>
              {vaccine_coverage.map((v, i) => {
                const total = v.TotalAssigned || 0;
                const completed = v.CompletedCount || 0;
                const pct = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
                return (
                  <tr key={i}>
                    <td><strong>{v.VaccineName}</strong></td>
                    <td>{total}</td>
                    <td><strong style={{ color: '#10b981' }}>{completed}</strong></td>
                    <td><span style={{ color: v.OverdueCount > 0 ? '#ef4444' : '#64748b', fontWeight: v.OverdueCount > 0 ? 700 : 400 }}>{v.OverdueCount}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: parseFloat(pct) > 75 ? '#10b981' : parseFloat(pct) > 40 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '42px' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
