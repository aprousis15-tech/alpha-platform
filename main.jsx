import { useState } from 'react'
import AlphaTerminal from './AlphaTerminal.jsx'
import ResearchHub from './ResearchHub.jsx'

const NAV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0C0C14; color: #fff; font-family: 'IBM Plex Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .nav-btn:hover { background: rgba(255,255,255,0.07) !important; }
`

export default function App() {
  const [page, setPage] = useState('terminal')

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C14' }}>
      <style>{NAV_CSS}</style>

      {/* ── Top Nav ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(12,12,20,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '52px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(135deg, #34D399, #60A5FA)',
            borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#0C0C14', fontSize: '13px', fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>∆</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'IBM Plex Mono, monospace', color: '#fff' }}>
            ALPHA PLATFORM
          </span>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '3px' }}>
          {[
            { id: 'terminal', icon: '◆', label: 'Alpha Terminal', sub: 'Stock Analyzer' },
            { id: 'hub',      icon: '◎', label: 'Research Hub',   sub: '9 Verticals'  },
          ].map(tab => (
            <button
              key={tab.id}
              className="nav-btn"
              onClick={() => setPage(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: page === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '11px', color: page === tab.id ? '#34D399' : 'rgba(255,255,255,0.3)' }}>{tab.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: page === tab.id ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.04em' }}>{tab.label}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.22)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.06em' }}>{tab.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px #34D399' }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em' }}>LIVE</span>
        </div>
      </div>

      {/* ── Page content ── */}
      <div>
        {page === 'terminal' && <AlphaTerminal />}
        {page === 'hub'      && <ResearchHub />}
      </div>
    </div>
  )
}
