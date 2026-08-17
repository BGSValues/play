import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Copy, Check, ArrowRight, MessageSquare, Lock, ArrowLeftRight, MessageCircle, Stamp, XCircle, CheckCircle2, Clock, Eye, Star } from 'lucide-react';
import PetAvatar from './PetAvatar';
import LiveChatModal from './LiveChatModal';

export default function Marketplace({ pets, currentUser, onOpenLogin }) {
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem('bgs_listings_v2');
    return saved ? JSON.parse(saved) : getInitialDemoListings();
  });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedRobloxId, setCopiedRobloxId] = useState(null);
  const [copiedDiscordId, setCopiedDiscordId] = useState(null);
  const [chatTraderTarget, setChatTraderTarget] = useState(null);
  const [offeringItems, setOfferingItems] = useState([]);
  const [requestingItems, setRequestingItems] = useState([]);
  const [itemPickerTarget, setItemPickerTarget] = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [formDiscord, setFormDiscord] = useState('');

  // Save listings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('bgs_listings_v2', JSON.stringify(listings));
  }, [listings]);

  function getInitialDemoListings() {
    return [
      {
        id: 'list_1', traderName: 'tnbURRdXAI', robloxUsername: 'tnbURRdXAI', discord: 'tnb_trader#1234',
        tag: 'FAIR', timeAgo: '2 minutes ago', status: 'open', interestedCount: 3,
        offering: [
          { name: 'Dominus Astra', rarity: 'Legendary', value: 250000, demand: 10, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/9c/Dominus_Astra.png' },
        ],
        requesting: [
          { name: 'Fallen Angel', rarity: 'Secret', value: 224655, demand: 10, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/d/d6/Mythic_Fallen_Angel.webp' }
        ],
      },
      {
        id: 'list_2', traderName: 'De4thKid1', robloxUsername: 'De4thKid1', discord: 'de4thkid_bgs',
        tag: 'OVERPAY', timeAgo: '5 minutes ago', status: 'completed', interestedCount: 7,
        offering: [
          { name: 'Shadow Challenger', rarity: 'Secret', value: 223593, demand: 10, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/91/Shadow_Challenger.png' }
        ],
        requesting: [
          { name: 'Elite Sentinel', rarity: 'Secret', value: 222515, demand: 9, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/4/4d/Elite_Sentinel.png' }
        ],
      },
      {
        id: 'list_3', traderName: 'aizen_ggz', robloxUsername: 'aizen_ggz', discord: 'aizen#5566',
        tag: 'FAIR', timeAgo: '8 minutes ago', status: 'open', interestedCount: 1,
        offering: [
          { name: 'Godly Shamrock', rarity: 'Secret', value: 222602, demand: 10, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/8/8e/Godly_Shamrock.png' }
        ],
        requesting: [
          { name: 'Kraken', rarity: 'Secret', value: 200000, demand: 10, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/f/fa/Kraken.png' }
        ],
      },
      {
        id: 'list_4', traderName: 'ignacio3207', robloxUsername: 'ignacio3207', discord: 'ignacio_trade',
        tag: 'UNDERPAY', timeAgo: '15 minutes ago', status: 'cancelled', interestedCount: 0,
        offering: [
          { name: 'The Overlord', rarity: 'Secret', value: 220000, demand: 10, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/a/aa/Mythic_The_Overlord.png' }
        ],
        requesting: [
          { name: 'Leviathan', rarity: 'Secret', value: 180000, demand: 10, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/9/9a/Leviathan.png' }
        ],
      },
      {
        id: 'list_5', traderName: 'xStarDust', robloxUsername: 'xStarDust', discord: 'stardust#9090',
        tag: 'FAIR', timeAgo: '20 minutes ago', status: 'open', interestedCount: 5,
        offering: [
          { name: 'Wolflord', rarity: 'Secret', value: 190000, demand: 10, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/5/53/Wolflord.png' },
          { name: 'Pyramidium', rarity: 'Secret', value: 170000, demand: 9, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/6/64/Pyramidium.png' }
        ],
        requesting: [
          { name: 'King Dogcat', rarity: 'Secret', value: 230000, demand: 10, image: 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/e/e9/King_Dogcat.png' }
        ],
      },
    ];
  }

  const calcVal = (items) => items?.reduce((s, i) => s + (i.value || 0), 0) || 0;
  const calcDemand = (items) => {
    if (!items?.length) return 0;
    return Math.round((items.reduce((s, i) => s + (i.demand || 5), 0) / items.length) * 10) / 10;
  };

  const handleCopy = (text, setter, id) => {
    navigator.clipboard.writeText(text);
    setter(id);
    setTimeout(() => setter(null), 2000);
  };

  const handleOpenChat = (trader) => {
    if (!currentUser) { if (onOpenLogin) onOpenLogin(); return; }
    setChatTraderTarget(trader);
  };

  // Trade Status Actions
  const handleMarkStatus = (listId, newStatus) => {
    setListings(prev => prev.map(l => l.id === listId ? { ...l, status: newStatus } : l));
  };

  const handleShowInterest = (listId) => {
    if (!currentUser) { if (onOpenLogin) onOpenLogin(); return; }
    setListings(prev => prev.map(l =>
      l.id === listId ? { ...l, interestedCount: (l.interestedCount || 0) + 1 } : l
    ));
  };

  const handleAddPetToListing = (pet) => {
    const item = { name: pet.name, value: pet.baseValue, demand: pet.demand || 5, image: pet.image, rarity: pet.rarity };
    if (itemPickerTarget === 'offer') setOfferingItems([...offeringItems, item]);
    else setRequestingItems([...requestingItems, item]);
    setItemPickerTarget(null); setPickerSearch('');
  };

  const handleCreateListing = (e) => {
    e.preventDefault();
    if (!currentUser || offeringItems.length === 0) return;
    const newListing = {
      id: 'list_' + Date.now(), traderName: currentUser.username,
      robloxUsername: currentUser.robloxUsername || currentUser.username,
      discord: formDiscord || 'BGS_Trader', tag: 'FAIR', timeAgo: 'just now',
      status: 'open', interestedCount: 0,
      offering: offeringItems, requesting: requestingItems,
    };
    setListings([newListing, ...listings]);
    setShowCreateModal(false); setOfferingItems([]); setRequestingItems([]); setFormDiscord('');
  };

  const statusConfig = {
    open: { label: 'OPEN', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: '🟢' },
    completed: { label: 'TRADE DONE ✅', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)', border: 'rgba(255,204,0,0.3)', icon: '✅' },
    cancelled: { label: 'CANCELLED ❌', color: '#ff1744', bg: 'rgba(255,23,68,0.12)', border: 'rgba(255,23,68,0.3)', icon: '❌' },
    pending: { label: 'PENDING ⏳', color: '#ff9100', bg: 'rgba(255,145,0,0.12)', border: 'rgba(255,145,0,0.3)', icon: '⏳' },
  };

  const tagColors = {
    FAIR: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
    OVERPAY: { color: '#ffcc00', bg: 'rgba(255,204,0,0.12)', border: 'rgba(255,204,0,0.3)' },
    UNDERPAY: { color: '#ff1744', bg: 'rgba(255,23,68,0.12)', border: 'rgba(255,23,68,0.3)' },
  };

  const filteredListings = listings.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.traderName.toLowerCase().includes(q) || l.discord?.toLowerCase().includes(q)
      || l.offering?.some(i => i.name.toLowerCase().includes(q))
      || l.requesting?.some(i => i.name.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <LiveChatModal isOpen={!!chatTraderTarget} onClose={() => setChatTraderTarget(null)} targetTrader={chatTraderTarget} currentUser={currentUser} />

      <div style={{ textAlign: 'center', margin: '1rem 0 1.5rem 0' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900' }}>
          Live Roblox BGS <span style={{ color: '#7c3aed' }}>Trade Marketplace</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.3rem' }}>
          Direct Discord & Roblox contacts — trade stamps show live deal status.
        </p>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div style={{ display: 'flex', gap: '0.75rem', flex: '1', minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" className="search-input-box" style={{ paddingLeft: '2.2rem', margin: 0 }}
              placeholder="Search pets, Roblox, Discord..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="search-input-box" style={{ width: '120px', margin: 0 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="open">🟢 Open</option>
            <option value="completed">✅ Done</option>
            <option value="cancelled">❌ Cancelled</option>
            <option value="pending">⏳ Pending</option>
          </select>
        </div>
        <button className="btn-primary" onClick={() => { if (!currentUser) { if (onOpenLogin) onOpenLogin(); return; } setShowCreateModal(true); }}>
          {currentUser ? <PlusCircle size={18} /> : <Lock size={18} />}
          {currentUser ? 'Post Trade Offer' : 'Login to Post'}
        </button>
      </div>

      {/* TRADE ADS GRID */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(580px, 1fr))', gap: '1.25rem' }}>
        {filteredListings.map((list) => {
          const offerVal = calcVal(list.offering);
          const offerDemand = calcDemand(list.offering);
          const reqVal = calcVal(list.requesting);
          const reqDemand = calcDemand(list.requesting);
          const st = statusConfig[list.status] || statusConfig.open;
          const tg = tagColors[list.tag] || tagColors.FAIR;
          const isOwn = currentUser && (list.traderName === currentUser.username);
          const isClosed = list.status === 'completed' || list.status === 'cancelled';

          return (
            <div key={list.id} className="glass-card" style={{
              background: '#0a0b10', border: '1px solid var(--glass-border)', padding: '1.15rem',
              display: 'flex', flexDirection: 'column', position: 'relative',
              opacity: isClosed ? 0.65 : 1, transition: 'opacity 0.3s',
            }}>

              {/* STATUS STAMP OVERLAY */}
              {isClosed && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-12deg)',
                  zIndex: 10, pointerEvents: 'none',
                  padding: '0.6rem 2rem', borderRadius: '8px',
                  border: `3px solid ${st.color}`, background: st.bg,
                  fontSize: '1.4rem', fontWeight: 900, color: st.color,
                  textTransform: 'uppercase', letterSpacing: '3px',
                  boxShadow: `0 0 30px ${st.color}40`,
                }}>
                  {st.label}
                </div>
              )}

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #00e5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.9rem' }}>
                    {list.traderName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      @{list.robloxUsername || list.traderName}
                      <span style={{ fontSize: '0.65rem', color: tg.color, background: tg.bg, border: `1px solid ${tg.border}`, padding: '1px 6px', borderRadius: '8px', fontWeight: 800 }}>{list.tag}</span>
                      <span style={{ fontSize: '0.65rem', color: st.color, background: st.bg, border: `1px solid ${st.border}`, padding: '1px 6px', borderRadius: '8px', fontWeight: 800 }}>{st.icon} {st.label.split(' ')[0]}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
                      <span>Discord: <strong>{list.discord || list.traderName + '#0001'}</strong></span>
                      <span style={{ color: '#64748b' }}>• {list.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <button className="filter-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', borderColor: '#7c3aed' }}
                    onClick={() => handleCopy(list.discord || list.traderName + '#0001', setCopiedDiscordId, list.id)}>
                    {copiedDiscordId === list.id ? <Check size={12} color="#10b981" /> : <MessageCircle size={12} />}
                    {copiedDiscordId === list.id ? 'Copied!' : 'Discord'}
                  </button>
                  <button className="filter-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    onClick={() => handleCopy(list.robloxUsername || list.traderName, setCopiedRobloxId, list.id)}>
                    {copiedRobloxId === list.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedRobloxId === list.id ? 'Copied!' : 'Roblox'}
                  </button>
                  <button className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => handleOpenChat(list)}>
                    <MessageSquare size={12} /> Chat
                  </button>
                </div>
              </div>

              {/* Trade Items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 28px 1fr', gap: '0.6rem', alignItems: 'center', background: '#07080c', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '12px', flex: 1 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase' }}>⚡ Offering</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ffcc00' }}>⚡{(offerVal/1000).toFixed(0)}K ~ {offerDemand}/10</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {list.offering.map((item, idx) => (
                      <div key={idx} style={{ background: '#0e0f17', border: '1px solid var(--glass-border)', padding: '0.35rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <PetAvatar name={item.name} rarity={item.rarity} image={item.image} size={34} />
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{item.name}</div>
                          <div style={{ fontSize: '0.65rem', color: '#ffcc00', fontWeight: 800 }}>⚡ {(item.value || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center', color: '#64748b' }}><ArrowRight size={18} /></div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00e5ff', textTransform: 'uppercase' }}>✨ Requesting</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ffcc00' }}>⚡{(reqVal/1000).toFixed(0)}K ~ {reqDemand}/10</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {list.requesting.length === 0 ? (
                      <div style={{ background: '#0e0f17', border: '1px dashed #7c3aed', padding: '0.5rem 0.8rem', borderRadius: '10px', color: '#a78bfa', fontSize: '0.78rem', fontWeight: 800 }}>??? OFFERS</div>
                    ) : list.requesting.map((item, idx) => (
                      <div key={idx} style={{ background: '#0e0f17', border: '1px solid var(--glass-border)', padding: '0.35rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <PetAvatar name={item.name} rarity={item.rarity} image={item.image} size={34} />
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{item.name}</div>
                          <div style={{ fontSize: '0.65rem', color: '#ffcc00', fontWeight: 800 }}>⚡ {(item.value || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* INTERACTION BAR: Interested count + Status Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button className="filter-btn" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', borderColor: '#a78bfa' }}
                    onClick={() => handleShowInterest(list.id)} disabled={isClosed}>
                    <Star size={13} color="#ffcc00" /> {list.interestedCount || 0} Interested
                  </button>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    <Eye size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{Math.floor(Math.random() * 50) + 10} views
                  </span>
                </div>

                {/* Owner status controls */}
                {isOwn && list.status === 'open' && (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button style={{ background: 'rgba(255,204,0,0.15)', border: '1px solid rgba(255,204,0,0.4)', color: '#ffcc00', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.73rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      onClick={() => handleMarkStatus(list.id, 'completed')}>
                      <CheckCircle2 size={13} /> Mark Done
                    </button>
                    <button style={{ background: 'rgba(255,145,0,0.15)', border: '1px solid rgba(255,145,0,0.4)', color: '#ff9100', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.73rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      onClick={() => handleMarkStatus(list.id, 'pending')}>
                      <Clock size={13} /> Pending
                    </button>
                    <button style={{ background: 'rgba(255,23,68,0.15)', border: '1px solid rgba(255,23,68,0.4)', color: '#ff1744', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.73rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      onClick={() => handleMarkStatus(list.id, 'cancelled')}>
                      <XCircle size={13} /> Cancel
                    </button>
                  </div>
                )}
                {isOwn && list.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button style={{ background: 'rgba(255,204,0,0.15)', border: '1px solid rgba(255,204,0,0.4)', color: '#ffcc00', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.73rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      onClick={() => handleMarkStatus(list.id, 'completed')}>
                      <CheckCircle2 size={13} /> Mark Done
                    </button>
                    <button style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.73rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      onClick={() => handleMarkStatus(list.id, 'open')}>
                      Re-open
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE LISTING MODAL */}
      {showCreateModal && currentUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowCreateModal(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Post Trade Ad</h3>
              <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateListing}>
              <div className="form-group">
                <label>Your Discord Tag *</label>
                <input type="text" className="form-input" placeholder="e.g. @discord_handle or User#1234" value={formDiscord} onChange={(e) => setFormDiscord(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa' }}>Offering ({offeringItems.length})</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', minHeight: '36px', background: '#08090d', padding: '0.4rem', borderRadius: '8px', margin: '4px 0 6px 0' }}>
                  {offeringItems.map((it, idx) => (
                    <span key={idx} style={{ background: '#141520', border: '1px solid #7c3aed', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {it.name} <button type="button" style={{ background: 'none', border: 'none', color: '#ff1744', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => setOfferingItems(offeringItems.filter((_, i) => i !== idx))}>×</button>
                    </span>
                  ))}
                </div>
                <button type="button" className="filter-btn" onClick={() => setItemPickerTarget('offer')}>+ Add Offering Pet</button>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00e5ff' }}>Requesting ({requestingItems.length})</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', minHeight: '36px', background: '#08090d', padding: '0.4rem', borderRadius: '8px', margin: '4px 0 6px 0' }}>
                  {requestingItems.map((it, idx) => (
                    <span key={idx} style={{ background: '#141520', border: '1px solid #00e5ff', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {it.name} <button type="button" style={{ background: 'none', border: 'none', color: '#ff1744', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => setRequestingItems(requestingItems.filter((_, i) => i !== idx))}>×</button>
                    </span>
                  ))}
                </div>
                <button type="button" className="filter-btn" onClick={() => setItemPickerTarget('request')}>+ Add Requesting Pet</button>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Post Trade Listing</button>
            </form>
          </div>
        </div>
      )}

      {/* PET PICKER */}
      {itemPickerTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setItemPickerTarget(null)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '75vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginBottom: '0.75rem' }}>Select Pet for {itemPickerTarget === 'offer' ? 'Offering' : 'Requesting'}</h4>
            <input type="text" className="search-input-box" placeholder="Search pet..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} autoFocus />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: '0.6rem', marginTop: '0.75rem' }}>
              {pets.filter(p => p.name.toLowerCase().includes(pickerSearch.toLowerCase())).slice(0, 50).map(p => (
                <div key={p.id} className="slot-item filled" style={{ cursor: 'pointer', padding: '0.5rem' }} onClick={() => handleAddPetToListing(p)}>
                  <PetAvatar name={p.name} rarity={p.rarity || 'Common'} image={p.image || ''} size={38} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, marginTop: '3px', textAlign: 'center' }}>{p.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#ffcc00', fontWeight: 700 }}>⚡ {(p.baseValue || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
