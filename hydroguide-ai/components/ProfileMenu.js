'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { LogOut, User, Crown, Palette, ChevronDown, Sparkles, History } from 'lucide-react'

export default function ProfileMenu({ user, profile, onThemeChange, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isPro = profile?.is_pro || false
  const currentTheme = profile?.theme_color || 'cyan'

  const handleThemeClick = async (color) => {
    if (!isPro && color !== 'cyan') {
      alert("🔒 Subscribe to unlock Premium Themes & Full History!")
      return
    }
    onThemeChange(color)
    await supabase.from('profiles').update({ theme_color: color }).eq('id', user.id)
  }

  const themes = [
    { id: 'cyan', color: '#22d3ee', label: 'Classic' },
    { id: 'gold', color: '#fbbf24', label: 'Gold' },
    { id: 'purple', color: '#c084fc', label: 'Neon' },
    { id: 'red', color: '#f87171', label: 'Mars' },
  ]

  // STYLES (Kept concise for readability)
  const styles = {
    menuBtn: {
      display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      padding: '8px 16px', borderRadius: '24px', cursor: 'pointer', color: 'white',
      fontWeight: '600', fontSize: '14px'
    },
    dropdown: {
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '280px', // Slightly wider for text
      background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px', padding: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      zIndex: 100, overflow: 'hidden'
    },
    section: { padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    item: {
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
        borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '14px'
    },
    upgradeBtn: {
        width: '100%', padding: '12px', borderRadius: '10px',
        background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
        color: '#451a03', fontWeight: 'bold', fontSize: '13px', border: 'none',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
    },
    colorGrid: { display: 'flex', gap: '8px', marginTop: '8px' },
    colorCircle: (c, locked) => ({
        width: '24px', height: '24px', borderRadius: '50%', background: c, cursor: 'pointer',
        border: currentTheme === c ? '2px solid white' : '2px solid transparent',
        opacity: locked ? 0.5 : 1, position: 'relative'
    })
  }

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.menuBtn} className="hover:bg-white/10">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <User size={16} />
        </div>
        <span>Profile</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div style={styles.dropdown} className="animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* PRO STATUS / UPSELL */}
            <div style={styles.section}>
                {isPro ? (
                    <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm bg-yellow-400/10 p-3 rounded-lg justify-center">
                        <Crown size={16} fill="currentColor" /> PRO ACTIVE
                    </div>
                ) : (
                    <a 
                        href="YOUR_NEW_SUBSCRIPTION_LINK_HERE" // <--- PASTE NEW STRIPE LINK HERE
                        target="_blank" 
                        rel="noreferrer"
                        style={{ textDecoration: 'none' }}
                    >
                        <button style={styles.upgradeBtn} className="hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} /> UNLOCK PRO
                            </div>
                            <span className="text-[10px] opacity-80 font-medium">
                                Get Themes & Full History
                            </span>
                        </button>
                    </a>
                )}
            </div>

            {/* THEMES */}
            <div style={styles.section}>
                <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
                    <Palette size={12} /> App Theme
                </div>
                <div style={styles.colorGrid}>
                    {themes.map((t) => {
                        const locked = !isPro && t.id !== 'cyan'
                        return (
                            <div 
                                key={t.id}
                                onClick={() => handleThemeClick(t.id)}
                                style={styles.colorCircle(t.color, locked)}
                            />
                        )
                    })}
                </div>
            </div>

            {/* ACTIONS */}
            <div className="p-2">
                <div style={styles.item} className="hover:bg-white/5 cursor-default text-white/50">
                    <History size={16} /> 
                    {isPro ? 'Full History Unlocked' : '7-Day History Limit'}
                </div>
                <div 
                    style={styles.item} onClick={onLogout}
                    className="hover:bg-red-500/10 hover:text-red-400 text-white/70 mt-2"
                >
                    <LogOut size={16} /> Sign Out
                </div>
            </div>
        </div>
      )}
    </div>
  )
}