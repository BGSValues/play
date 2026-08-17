import React, { useState, useEffect } from 'react';
import { Send, X, MessageSquare, CheckCircle2, User, Gamepad2, Copy, Check } from 'lucide-react';

export default function LiveChatModal({ isOpen, onClose, targetTrader, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (targetTrader && currentUser) {
      const chatKey = `chat_${[currentUser.username, targetTrader.username || targetTrader.traderName].sort().join('_')}`;
      const saved = localStorage.getItem(chatKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Initial automated greeting message
        const initial = [
          {
            id: 'msg_1',
            sender: targetTrader.username || targetTrader.traderName,
            text: `Hey @${currentUser.username}! I saw your trade listing. Are you interested in trading?`,
            timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: false,
          },
        ];
        setMessages(initial);
        localStorage.setItem(chatKey, JSON.stringify(initial));
      }
    }
  }, [targetTrader, currentUser]);

  if (!isOpen || !targetTrader) return null;

  const traderName = targetTrader.username || targetTrader.traderName || 'Trader';
  const robloxHandle = targetTrader.robloxUsername || traderName;

  const handleSendMessage = (textToSend) => {
    const msgText = textToSend || inputText;
    if (!msgText.trim()) return;

    const newMsg = {
      id: 'msg_' + Date.now(),
      sender: currentUser.username,
      text: msgText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false,
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText('');

    const chatKey = `chat_${[currentUser.username, traderName].sort().join('_')}`;
    localStorage.setItem(chatKey, JSON.stringify(updated));

    // Simulated trader automated reply after 2 seconds
    setTimeout(() => {
      const replies = [
        `Sounds good! My Roblox username is @${robloxHandle}. Send me a friend request or join my server!`,
        `Can you add 1 more Legendary to balance the value?`,
        `Deal! I'm online in BGS right now at Trading Plaza.`,
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg = {
        id: 'msg_' + Date.now(),
        sender: traderName,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: false,
      };
      setMessages((prev) => {
        const next = [...prev, replyMsg];
        localStorage.setItem(chatKey, JSON.stringify(next));
        return next;
      });
    }, 2000);
  };

  const handleSendRobloxJoinLink = () => {
    const robloxLink = `https://www.roblox.com/games/286090429/Bubble-Gum-Simulator?privateServerLinkCode=bgs_trade_${Date.now()}`;
    handleSendMessage(`🎮 Join my Roblox BGS Private Server: ${robloxLink}`);
  };

  const handleCopyRobloxUser = () => {
    navigator.clipboard.writeText(robloxHandle);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '540px', height: '620px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: '1px solid #7c3aed', boxShadow: '0 20px 50px rgba(124, 58, 237, 0.3)' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Chat Header */}
        <div style={{ background: '#0d0e14', borderBottom: '1px solid var(--glass-border)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #00e5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '1rem' }}>
                {traderName.charAt(0).toUpperCase()}
              </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '11px', height: '11px', borderRadius: '50%', background: '#10b981', border: '2px solid #0d0e14' }} />
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {traderName}
                <span style={{ fontSize: '0.68rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle2 size={10} /> Online
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Roblox: @{robloxHandle}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }} onClick={handleCopyRobloxUser}>
              {copiedLink ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copiedLink ? 'Copied!' : 'Copy Roblox ID'}
            </button>
            <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Quick Join Game Toolbar */}
        <div style={{ background: '#141520', borderBottom: '1px solid var(--glass-border)', padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Gamepad2 size={15} /> Roblox Trade Discussion
          </span>
          <button style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleSendRobloxJoinLink}>
            🎮 Share BGS Game Join Link
          </button>
        </div>

        {/* Messages Body */}
        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#060709' }}>
          {messages.map((msg) => {
            const isMe = msg.sender === currentUser.username;
            return (
              <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '3px', textAlign: isMe ? 'right' : 'left' }}>
                  {isMe ? 'You' : msg.sender} • {msg.timestamp}
                </div>
                <div
                  style={{
                    background: isMe ? '#7c3aed' : '#141520',
                    color: '#ffffff',
                    padding: '0.7rem 1rem',
                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    fontSize: '0.88rem',
                    lineHeight: 1.4,
                    border: isMe ? 'none' : '1px solid var(--glass-border)',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preset Quick Chips */}
        <div style={{ padding: '0.5rem 1rem', background: '#0a0b10', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
          {["Is this trade still available?", "I can offer Secret Dragon!", "Join my Roblox server!"].map((chip) => (
            <button key={chip} style={{ background: '#141520', border: '1px solid var(--glass-border)', color: '#a78bfa', padding: '3px 10px', borderRadius: '12px', fontSize: '0.73rem', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => handleSendMessage(chip)}>
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ padding: '0.85rem 1.25rem', background: '#0d0e14', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.6rem' }}>
          <input
            type="text"
            className="search-input-box"
            placeholder={`Message @${traderName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ margin: 0, flex: 1, padding: '0.65rem 1rem', fontSize: '0.88rem' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.1rem', borderRadius: '10px' }}>
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
