import React, { useState } from 'react';
import { PlusCircle, Trash2, ShieldCheck, AlertTriangle, Sparkles, CheckCircle2, X, RefreshCw, Scale, Copy, Check, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import PetAvatar from './PetAvatar';
import { getVariantMultiplier } from './ValueList';

export default function TradeCalculator({ pets, sideA, setSideA, sideB, setSideB }) {
  const [activeSide, setActiveSide] = useState(null); // 'A' or 'B'
  const [pickerSearch, setPickerSearch] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  const calculateTotalVal = (items) => {
    return items.reduce((sum, item) => {
      const val = typeof item.calculatedValue === 'number' ? item.calculatedValue : (typeof item.baseValue === 'number' ? item.baseValue : 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const calculateAvgDemand = (items) => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + (item.demand || 5), 0);
    return Math.round((sum / items.length) * 10) / 10;
  };

  const totalA = calculateTotalVal(sideA);
  const totalB = calculateTotalVal(sideB);
  const avgDemandA = calculateAvgDemand(sideA);
  const avgDemandB = calculateAvgDemand(sideB);

  const diff = totalB - totalA;
  const totalBoth = totalA + totalB;
  const percentA = totalBoth > 0 ? Math.round((totalA / totalBoth) * 100) : 50;
  const percentB = totalBoth > 0 ? 100 - percentA : 50;

  const winRatio = totalA > 0 ? (totalB / totalA) : 1;

  let verdict = {
    title: 'ADD PETS TO CALCULATE',
    subtitle: 'Select items on both sides to evaluate trade fairness',
    badgeClass: 'status-stable',
    color: '#64748b',
    glowColor: 'rgba(148, 163, 184, 0.2)',
    icon: <Scale size={24} color="#94a3b8" />,
  };

  if (sideA.length > 0 || sideB.length > 0) {
    if (winRatio >= 1.25) {
      verdict = {
        title: 'HUGE WIN 🎉',
        subtitle: `You gain +${diff.toLocaleString()} value (+${Math.round((winRatio - 1) * 100)}% profit)`,
        badgeClass: 'status-rising',
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        icon: <Sparkles size={26} color="#10b981" />,
      };
    } else if (winRatio >= 1.08) {
      verdict = {
        title: 'WIN 👍',
        subtitle: `You gain +${diff.toLocaleString()} value! Great trade for you`,
        badgeClass: 'status-rising',
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.25)',
        icon: <CheckCircle2 size={26} color="#10b981" />,
      };
    } else if (winRatio <= 0.75) {
      verdict = {
        title: 'BIG LOSS ⚠️',
        subtitle: `You lose -${Math.abs(diff).toLocaleString()} value (-${Math.round((1 - winRatio) * 100)}% loss)`,
        badgeClass: 'status-hyped',
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.35)',
        icon: <AlertTriangle size={26} color="#ef4444" />,
      };
    } else if (winRatio <= 0.92) {
      verdict = {
        title: 'LOSS 📉',
        subtitle: `You lose -${Math.abs(diff).toLocaleString()} value. Ask for additional pets`,
        badgeClass: 'status-dropping',
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.3)',
        icon: <AlertTriangle size={26} color="#f59e0b" />,
      };
    } else {
      verdict = {
        title: 'FAIR TRADE ⚖️',
        subtitle: 'Both sides are closely balanced in value!',
        badgeClass: 'status-stable',
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.3)',
        icon: <ShieldCheck size={26} color="#06b6d4" />,
      };
    }
  }

  const handleAddPetToSide = (pet) => {
    const isHat = pet.type === 'hat' || pet.category === 'Hats';
    const defaultVariant = 'Normal';
    const hasVal = typeof pet.baseValue === 'number' && !isNaN(pet.baseValue) && pet.baseValue > 0;
    const mult = isHat ? 1 : getVariantMultiplier(pet, defaultVariant);
    const calculatedValue = hasVal ? Math.round(pet.baseValue * mult) : null;

    const item = {
      ...pet,
      slotId: Date.now() + Math.random(),
      selectedVariant: defaultVariant,
      calculatedValue,
    };

    if (activeSide === 'A' && sideA.length < 8) {
      setSideA([...sideA, item]);
    } else if (activeSide === 'B' && sideB.length < 8) {
      setSideB([...sideB, item]);
    }

    setActiveSide(null);
    setPickerSearch('');
  };

  const handleVariantSelect = (side, slotId, variant) => {
    const updater = (prevItems) =>
      prevItems.map((item) => {
        if (item.slotId === slotId) {
          const isHat = item.type === 'hat' || item.category === 'Hats';
          const hasVal = typeof item.baseValue === 'number' && !isNaN(item.baseValue) && item.baseValue > 0;
          const mult = isHat ? 1 : getVariantMultiplier(item, variant);
          return {
            ...item,
            selectedVariant: variant,
            calculatedValue: hasVal ? Math.round(item.baseValue * mult) : null,
          };
        }
        return item;
      });

    if (side === 'A') setSideA(updater);
    else setSideB(updater);
  };

  const handleRemoveItem = (side, slotId) => {
    if (side === 'A') setSideA(sideA.filter((i) => i.slotId !== slotId));
    else setSideB(sideB.filter((i) => i.slotId !== slotId));
  };

  const handleCopyTradeSummary = () => {
    const sideANames = sideA.map(i => `${i.selectedVariant !== 'Normal' ? i.selectedVariant + ' ' : ''}${i.name}`).join(', ') || 'Nothing';
    const sideBNames = sideB.map(i => `${i.selectedVariant !== 'Normal' ? i.selectedVariant + ' ' : ''}${i.name}`).join(', ') || 'Nothing';
    const summaryText = `BGS Trade: [Your Offer: ${sideANames} (⚡ ${totalA.toLocaleString()})] VS [Their Offer: ${sideBNames} (⚡ ${totalB.toLocaleString()})] -> Result: ${verdict.title}`;
    
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const filteredPickerPets = pets.filter((p) => p.name.toLowerCase().includes(pickerSearch.toLowerCase()));

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.25rem 1.25rem 4rem 1.25rem' }}>
      
      {/* 🔮 ORACLE VERDICT ARENA */}
      <div style={{ background: '#0a0b10', border: `1px solid ${verdict.color}`, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: `0 12px 35px ${verdict.glowColor}`, textAlign: 'center', transition: 'all 0.3s ease' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#12131c', border: `1px solid ${verdict.color}`, padding: '0.45rem 1.6rem', borderRadius: '20px', fontSize: '1.05rem', fontWeight: 900, color: verdict.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {verdict.icon} {verdict.title}
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>{verdict.subtitle}</p>

        {/* Real-time Percentage Win/Loss Gauge Bar */}
        <div style={{ marginTop: '1.25rem', maxWidth: '750px', margin: '1.25rem auto 0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
            <span>YOUR OFFER: <strong style={{ color: '#a78bfa' }}>{percentA}%</strong></span>
            <span>DIFFERENCE: <strong style={{ color: diff >= 0 ? '#10b981' : '#ef4444' }}>{diff >= 0 ? `+${diff.toLocaleString()}` : `-${Math.abs(diff).toLocaleString()}`}</strong></span>
            <span>THEIR OFFER: <strong style={{ color: '#ffcc00' }}>{percentB}%</strong></span>
          </div>

          <div style={{ width: '100%', height: '14px', background: '#050608', borderRadius: '10px', overflow: 'hidden', display: 'flex', border: '1px solid var(--glass-border)' }}>
            <div style={{ width: `${percentA}%`, background: 'linear-gradient(90deg, #6366f1, #7c3aed)', transition: 'width 0.4s ease' }} />
            <div style={{ width: `${percentB}%`, background: 'linear-gradient(90deg, #f59e0b, #ffcc00)', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {/* ⚔️ DUAL TRADE CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* 👤 SIDE A: YOUR OFFER */}
        <div className="glass-card" style={{ borderLeft: '4px solid #7c3aed', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                👤 Your Offer
              </div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
                <TrendingUp size={13} style={{ display: 'inline', marginRight: '4px' }} /> Avg Demand: {avgDemandA}/10
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Value</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#a78bfa' }}>⚡ {totalA.toLocaleString()}</div>
            </div>
          </div>

          {/* Trade Item Grid (8 Slots) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', flex: 1, minHeight: '260px' }}>
            {sideA.map((item) => {
              const isHat = item.type === 'hat' || item.category === 'Hats';
              return (
                <div key={item.slotId} style={{ background: '#08090d', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.65rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <button style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: '#fff', border: 'none', width: '18px', height: '18px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleRemoveItem('A', item.slotId)}>
                    <X size={12} />
                  </button>
                  <PetAvatar name={item.name} rarity={item.rarity} image={item.image} size={55} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: '4px', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  
                  {!isHat ? (
                    <select
                      style={{ background: '#000', color: '#a78bfa', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', margin: '4px 0', width: '90%', fontFamily: 'inherit' }}
                      value={item.selectedVariant}
                      onChange={(e) => handleVariantSelect('A', item.slotId, e.target.value)}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Shiny">Shiny</option>
                      <option value="Mythic">Mythic</option>
                      <option value="ShinyMythic">S.Myth</option>
                    </select>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, margin: '6px 0' }}>HAT</div>
                  )}

                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--primary-gold)' }}>
                    {item.calculatedValue ? `⚡ ${item.calculatedValue.toLocaleString()}` : <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </div>
                </div>
              );
            })}

            {sideA.length < 8 && (
              <button
                style={{ background: 'rgba(124, 58, 237, 0.06)', border: '2px dashed #7c3aed', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '1rem', minHeight: '110px', transition: 'all 0.2s ease' }}
                onClick={() => setActiveSide('A')}
              >
                <PlusCircle size={28} color="#7c3aed" />
                <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 800, marginTop: '6px' }}>+ Add Item</span>
              </button>
            )}
          </div>

          {sideA.length > 0 && (
            <button style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setSideA([])}>
              <Trash2 size={13} /> Clear Side A
            </button>
          )}
        </div>

        {/* 🤝 SIDE B: THEIR OFFER */}
        <div className="glass-card" style={{ borderLeft: '4px solid #ffcc00', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🤝 Their Offer
              </div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
                <TrendingUp size={13} style={{ display: 'inline', marginRight: '4px' }} /> Avg Demand: {avgDemandB}/10
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Value</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffcc00' }}>⚡ {totalB.toLocaleString()}</div>
            </div>
          </div>

          {/* Trade Item Grid (8 Slots) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', flex: 1, minHeight: '260px' }}>
            {sideB.map((item) => {
              const isHat = item.type === 'hat' || item.category === 'Hats';
              return (
                <div key={item.slotId} style={{ background: '#08090d', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.65rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <button style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: '#fff', border: 'none', width: '18px', height: '18px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleRemoveItem('B', item.slotId)}>
                    <X size={12} />
                  </button>
                  <PetAvatar name={item.name} rarity={item.rarity} image={item.image} size={55} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: '4px', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  
                  {!isHat ? (
                    <select
                      style={{ background: '#000', color: '#ffcc00', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', margin: '4px 0', width: '90%', fontFamily: 'inherit' }}
                      value={item.selectedVariant}
                      onChange={(e) => handleVariantSelect('B', item.slotId, e.target.value)}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Shiny">Shiny</option>
                      <option value="Mythic">Mythic</option>
                      <option value="ShinyMythic">S.Myth</option>
                    </select>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, margin: '6px 0' }}>HAT</div>
                  )}

                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--primary-gold)' }}>
                    {item.calculatedValue ? `⚡ ${item.calculatedValue.toLocaleString()}` : <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </div>
                </div>
              );
            })}

            {sideB.length < 8 && (
              <button
                style={{ background: 'rgba(255, 204, 0, 0.06)', border: '2px dashed #ffcc00', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '1rem', minHeight: '110px', transition: 'all 0.2s ease' }}
                onClick={() => setActiveSide('B')}
              >
                <PlusCircle size={28} color="#ffcc00" />
                <span style={{ fontSize: '0.8rem', color: '#ffcc00', fontWeight: 800, marginTop: '6px' }}>+ Add Item</span>
              </button>
            )}
          </div>

          {sideB.length > 0 && (
            <button style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setSideB([])}>
              <Trash2 size={13} /> Clear Side B
            </button>
          )}
        </div>

      </div>

      {/* 🛠️ QUICK ACTION TOOLBAR */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginTop: '1.5rem', background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '0.75rem 1.25rem', borderRadius: '14px', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          className="btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
          onClick={handleCopyTradeSummary}
        >
          {copiedSummary ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
          {copiedSummary ? 'Trade Summary Copied!' : 'Copy Trade Summary for Discord/Roblox'}
        </button>

        {(sideA.length > 0 || sideB.length > 0) && (
          <button
            style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 1.2rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
            onClick={() => { setSideA([]); setSideB([]); }}
          >
            <RefreshCw size={14} /> Reset Entire Trade
          </button>
        )}
      </div>

      {/* PET PICKER MODAL */}
      {activeSide && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={() => setActiveSide(null)}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '720px', maxHeight: '82vh', overflowY: 'auto', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>
                Select Pet for <span style={{ color: activeSide === 'A' ? '#a78bfa' : '#ffcc00' }}>{activeSide === 'A' ? 'Your Offer' : 'Their Offer'}</span>
              </h3>
              <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setActiveSide(null)}>
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              className="search-input-box"
              placeholder={`Search ${pets.length.toLocaleString()} pets...`}
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              style={{ marginBottom: '1.25rem' }}
              autoFocus
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.85rem' }}>
              {filteredPickerPets.slice(0, 150).map((p) => (
                <div
                  key={p.id}
                  className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem 0.5rem', cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid var(--glass-border)' }}
                  onClick={() => handleAddPetToSide(p)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = activeSide === 'A' ? '#7c3aed' : '#ffcc00'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <PetAvatar name={p.name} rarity={p.rarity} image={p.image} size={55} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, marginTop: '0.4rem', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary-gold)', marginTop: '2px' }}>
                    {p.baseValue ? `⚡ ${p.baseValue.toLocaleString()}` : <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
