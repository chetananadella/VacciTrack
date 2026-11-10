import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1.25rem 2rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div>
          <strong>VaccTrack</strong> – Smart Child Vaccination Management System
        </div>
        <div>
          Academic Prototype | College Community Service Project 2026
        </div>
      </div>
    </footer>
  );
};

export default Footer;
