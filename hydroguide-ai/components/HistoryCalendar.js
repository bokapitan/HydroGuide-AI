'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ChevronLeft, ChevronRight, CheckCircle2, Crown } from 'lucide-react'

export default function HistoryCalendar({ user, dailyGoal, refreshTrigger }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [history, setHistory] = useState({})
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  const safeGoal = dailyGoal && dailyGoal > 0 ? dailyGoal : 100

  useEffect(() => { fetchHistory() }, [currentDate, refreshTrigger, dailyGoal])

  const fetchHistory = async () => {
    setLoading(true)
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()

    const [profileResponse, logsResponse] = await Promise.all([
        supabase.from('profiles').select('is_pro').eq('id', user.id).single(),
        supabase.from('water_logs').select('date, amount_oz').eq('user_id', user.id).gte('date', startOfMonth).lte('date', endOfMonth)
    ])

    if (profileResponse.data) setIsPro(profileResponse.data.is_pro)

    if (logsResponse.data) {
      const aggregated = {}
      logsResponse.data.forEach(log => {
        if (!aggregated[log.date]) aggregated[log.date] = 0
        aggregated[log.date] += log.amount_oz
      })
      setHistory(aggregated)
    }
    setLoading(false)
  }

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)))
  }

  // --- LOGIC: 7 DAY CUTOFF ---
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)

  // Calendar Helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const daySlots = new Array(42).fill(null)
  for (let i = 0; i < daysInMonth; i++) daySlots[firstDay + i] = new Date(year, month, i + 1)
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  // --- STYLES ---
  const styles = {
    card: {
      width: '100%', aspectRatio: '1 / 1', maxWidth: '500px', padding: '24px',
      background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)',
      borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      margin: '0 auto', overflow: 'hidden'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    navBtn: {
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'all 0.2s ease',
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', flexGrow: 1, minHeight: 0, width: '100%' },
    dayLabel: { textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' },
    
    // TILE STYLE
    dayTile: (percent, isLocked) => {
        let bg = 'rgba(255, 255, 255, 0.02)' 
        let border = 'rgba(255, 255, 255, 0.05)'
        let shadow = 'none'
        
        if (isLocked) {
             bg = 'rgba(0, 0, 0, 0.1)' 
             border = 'rgba(255, 255, 255, 0.02)'
        } 
        else if (percent > 0 && percent < 100) {
            bg = 'rgba(6, 182, 212, 0.25)'; border = 'rgba(6, 182, 212, 0.5)'
        } 
        else if (percent >= 100) {
            bg = 'rgba(16, 185, 129, 0.3)'; border = 'rgba(16, 185, 129, 0.8)';
            shadow = '0 0 12px rgba(16, 185, 129, 0.4)'
        }

        return {
            background: bg, border: `1px solid ${border}`, borderRadius: '8px',
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: 'white',
            position: 'relative', boxShadow: shadow, transition: 'all 0.3s ease',
        }
    },
    footer: {
      display: 'flex', justifyContent: 'center', gap: '16px', // Reduced gap slightly to fit 4 items
      marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
    
    // UPDATED LEGEND BOX LOGIC
    legendBox: (type) => {
        let bg, border;
        if (type === 'empty') { bg = 'rgba(255, 255, 255, 0.05)'; border = 'rgba(255, 255, 255, 0.1)'; } 
        else if (type === 'track') { bg = 'rgba(6, 182, 212, 0.25)'; border = 'rgba(6, 182, 212, 0.5)'; } 
        else if (type === 'met') { bg = 'rgba(16, 185, 129, 0.3)'; border = 'rgba(16, 185, 129, 0.8)'; } // <-- ADDED MET
        else if (type === 'locked') { bg = 'rgba(0, 0, 0, 0.2)'; border = 'rgba(255, 255, 255, 0.05)'; }
        
        return {
            width: '12px', height: '12px', borderRadius: '3px',
            background: bg, border: `1px solid ${border}`
        }
    }
  }

  return (
    <div style={styles.card}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={() => changeMonth(-1)} style={styles.navBtn} className="hover:bg-white/10"><ChevronLeft size={16} /></button>
        <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                {monthNames[currentDate.getMonth()]}
                {isPro && <Crown size={14} className="text-yellow-400 fill-yellow-400" />}
            </h2>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{currentDate.getFullYear()}</p>
        </div>
        <button onClick={() => changeMonth(1)} style={styles.navBtn} className="hover:bg-white/10"><ChevronRight size={16} /></button>
      </div>

      {/* LABELS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', width: '100%' }}>
        {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} style={styles.dayLabel}>{d}</div>)}
      </div>

      {/* GRID */}
      <div style={styles.grid}>
        {daySlots.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} style={{...styles.dayTile(0, false), background: 'transparent', border: 'none'}}></div>

            const dateKey = date.toISOString().split('T')[0]
            const amount = history[dateKey] || 0
            const percent = Math.min((amount / safeGoal) * 100, 100)
            const isToday = new Date().toISOString().split('T')[0] === dateKey
            const isLocked = !isPro && date < sevenDaysAgo

            return (
                <div 
                    key={dateKey} 
                    style={{
                        ...styles.dayTile(percent, isLocked),
                        ...(isToday ? { border: '1px solid white', boxShadow: '0 0 10px rgba(255,255,255,0.2)' } : {})
                    }}
                    className="group"
                    title={isLocked ? "Subscribe to view history" : `${amount} oz`}
                >
                    <span className={`text-[10px] font-bold ${isLocked ? 'opacity-30' : 'opacity-80'}`}>
                        {date.getDate()}
                    </span>

                    {!isLocked && amount > 0 && (
                        <div className="mt-0.5">
                            {percent >= 100 ? (
                                <CheckCircle2 size={12} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.8)]"></div>
                            )}
                        </div>
                    )}
                </div>
            )
        })}
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div style={styles.legendItem}>
            <div style={styles.legendBox('empty')}></div>
            <span className="text-[9px] uppercase text-white/40 font-bold">Empty</span>
        </div>
        <div style={styles.legendItem}>
            <div style={styles.legendBox('track')}></div>
            <span className="text-[9px] uppercase text-white/60 font-bold">Started</span>
        </div>
        <div style={styles.legendItem}>
            <div style={styles.legendBox('met')}></div>
            <span className="text-[9px] uppercase text-emerald-400 font-bold">Goal Met</span>
        </div>
        {!isPro && (
            <div style={styles.legendItem}>
                <div style={styles.legendBox('locked')}></div>
                <span className="text-[9px] uppercase text-white/40 font-bold">Locked</span>
            </div>
        )}
      </div>

    </div>
  )
}