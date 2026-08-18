import React from 'react';
import { ShieldAlert, Lock, Wrench, RefreshCw } from 'lucide-react';

export default function MaintenanceScreen({ message, onStaffLoginClick }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #07090e 80%)',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '580px',
          width: '100%',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 204, 0, 0.4)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'rgba(255, 204, 0, 0.12)',
            border: '1px solid rgba(255, 204, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 0 35px rgba(255, 204, 0, 0.25)',
          }}
        >
          <ShieldAlert size={40} color="var(--primary-gold)" />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 204, 0, 0.15)', color: '#ffcc00', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 900, marginBottom: '1rem' }}>
          <Wrench size={14} /> SYSTEM SAFEGUARD ACTIVE
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>
          Platform Under <span style={{ color: 'var(--primary-gold)' }}>Maintenance</span>
        </h1>

        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {message || 'The BGS Trading Hub is currently in Safeguard Maintenance Mode while market values and new event items are being audited. Please check back shortly!'}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="filter-btn"
            onClick={() => window.location.reload()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.75rem 1.4rem' }}
          >
            <RefreshCw size={16} /> Check Status
          </button>

          <button
            className="btn-primary"
            onClick={onStaffLoginClick}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.75rem 1.4rem' }}
          >
            <Lock size={16} /> Staff Access Portal
          </button>
        </div>
      </div>
    </div>
  );
}
