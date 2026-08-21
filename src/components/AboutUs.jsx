import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  HeartHandshake,
  Star,
  Lock,
  FileText,
  AlertOctagon,
  Gamepad2,
  ExternalLink,
  CheckCircle2,
  Shield,
  Zap,
  Radio,
  Layers,
  Scale,
  Compass,
  MessageCircle,
} from 'lucide-react';
import defaultAboutData from '../data/aboutUsData.json';

export default function AboutUs({ currentUser }) {
  const [aboutData, setAboutData] = useState(() => {
    try {
      const saved = localStorage.getItem('bgs_about_us_data');
      return saved ? JSON.parse(saved) : defaultAboutData;
    } catch {
      return defaultAboutData;
    }
  });

  // If currentUser is an Owner, auto-sync their customized username and roblox handle onto the Owner card
  const staffList = (aboutData.staff || []).map((member) => {
    if (member.role === 'owner' && currentUser && currentUser.role === 'owner') {
      return {
        ...member,
        name: currentUser.username || member.name,
        roblox: currentUser.robloxUsername || member.roblox,
        discord: currentUser.discord || member.discord,
      };
    }
    return member;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1.5rem 6rem 1.5rem' }}>
      {/* ━━━━ MODERN HERO BANNER ━━━━ */}
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem 2.5rem 1.5rem',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(255, 204, 0, 0.15), rgba(124, 58, 237, 0.15))',
            border: '1px solid rgba(255, 204, 0, 0.4)',
            color: '#ffcc00',
            padding: '0.45rem 1.25rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 900,
            marginBottom: '1.25rem',
            letterSpacing: '0.6px',
            boxShadow: '0 0 25px rgba(255, 204, 0, 0.2)',
          }}
        >
          <Sparkles size={15} color="#ffcc00" /> {aboutData.hero?.badge || 'OFFICIAL BUBBLE GUM SIMULATOR COMMUNITY'}
        </div>

        <h1
          style={{
            fontSize: '3.4rem',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '1rem',
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
          }}
        >
          About <span style={{ color: 'var(--primary-gold)' }}>BGS Values</span> Hub
        </h1>

        <p
          style={{
            color: '#cbd5e1',
            fontSize: '1.1rem',
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.65,
          }}
        >
          {aboutData.hero?.subtitle || 'Built by passionate Bubble Gum Simulator veterans and active traders to deliver the most accurate, real-time, non-duped valuation lists and trading tools in Roblox.'}
        </p>

        {/* Floating Stat Counters Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {(aboutData.hero?.stats || defaultAboutData.hero.stats).map((st, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: '0.85rem 1.5rem',
                borderRadius: '16px',
                border: `1px solid ${st.color}33`,
                background: 'rgba(10, 11, 16, 0.75)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '200px',
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: st.color }}>
                {st.value}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
                  {st.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━ LEADERSHIP & STAFF SECTION ━━━━ */}
      <div style={{ marginTop: '3rem', marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: 0 }}>
            Meet The <span style={{ color: 'var(--primary-gold)' }}>Leadership & Staff</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            The verified administration managing real-time market sync, Wiki databases, and community trust.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {staffList.map((member) => (
            <div
              key={member.id}
              className="glass-card"
              style={{
                padding: '2.25rem',
                borderRadius: '22px',
                border: `1px solid ${member.badgeColor}44`,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(10, 11, 16, 0.9) 100%)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = member.badgeColor;
                e.currentTarget.style.boxShadow = `0 10px 40px ${member.badgeColor}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${member.badgeColor}44`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Header with Avatar and Role */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: member.avatarColor,
                    color: member.role === 'owner' ? '#000' : '#fff',
                    fontSize: '1.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 25px ${member.badgeColor}44`,
                    flexShrink: 0,
                  }}
                >
                  {member.icon || '🛡️'}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                      {member.name}
                    </h3>
                    <span
                      style={{
                        background: `${member.badgeColor}22`,
                        border: `1px solid ${member.badgeColor}66`,
                        color: member.badgeColor,
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {member.roleBadge || member.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: member.badgeColor, fontWeight: 800, marginTop: '2px' }}>
                    {member.title}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                {member.bio}
              </p>

              {/* Social / Game Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {member.roblox && (
                  <span style={{ fontSize: '0.8rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '5px 12px', borderRadius: '8px', color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    🎮 Roblox: <strong style={{ color: '#00e5ff' }}>{member.roblox}</strong>
                  </span>
                )}
                {member.discord && (
                  <span style={{ fontSize: '0.8rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '5px 12px', borderRadius: '8px', color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    💬 Discord: <strong style={{ color: '#a78bfa' }}>{member.discord}</strong>
                  </span>
                )}
                <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '5px 12px', borderRadius: '8px', color: '#10b981', fontWeight: 800 }}>
                  🟢 Verified Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━ PLATFORM PILLARS & GUARANTEES ━━━━ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255, 204, 0, 0.3)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 204, 0, 0.12)', border: '1px solid rgba(255, 204, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Zap size={22} color="#ffcc00" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem' }}>
            Direct Collab Synchronization
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            Every trade value is directly matched with the BGS Collab Value List. Pets without an official trade listing are strictly marked N/A to prevent fake market inflation.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Compass size={22} color="#00e5ff" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem' }}>
            Fandom Wiki & Lua Stat Verification
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            All pet multipliers, bubbles/coins/gems stat formulas, egg hatch probabilities, and official 3D models are verified against the official BGS game code.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldCheck size={22} color="#ec4899" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem' }}>
            Zero-Dupe Integrity Protocol
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            Exploited, cloned, and duplicated items from legacy game vulnerabilities are strictly excluded from our databases to safeguard player trade values.
          </p>
        </div>
      </div>
    </div>
  );
}
