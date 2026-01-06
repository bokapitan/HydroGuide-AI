'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import WaveMeter from './WaveMeter'
import { RotateCcw, Settings, Zap, Droplets, GlassWater } from 'lucide-react'

export default function HydrationTracker({ user, dailyGoal, onUpdate }) {
  const [todayTotal, setTodayTotal] = useState(0)
  const [sliderValue, setSliderValue] = useState(0)
  const [bottleSize, setBottleSize] = useState(0) 
  const [isEditingBottle, setIsEditingBottle] = useState(false) 

  const safeGoal = dailyGoal && dailyGoal > 0 ? dailyGoal : 100 

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data: profileData } = await supabase.from('profiles').select('bottle_capacity').eq('id', user.id).single()
    if (profileData) setBottleSize(profileData.bottle_capacity || 24)

    const { data: todayLogs } = await supabase.from('water_logs').select('amount_oz').eq('user_id', user.id).eq('date', today)
    if (todayLogs) {
      const total = todayLogs.reduce((sum, log) => sum + log.amount_oz, 0)
      setTodayTotal(total)
    }
  }

  const logWater = async (amount) => {
    if (!amount || amount <= 0) return
    const today = new Date().toISOString().split('T')[0]
    setTodayTotal(prev => prev + amount) 
    const { error } = await supabase.from('water_logs').insert({ user_id: user.id, date: today, amount_oz: amount, daily_goal: safeGoal })
    if (error) setTodayTotal(prev => prev - amount)
    else { fetchData(); if (onUpdate) onUpdate() }
  }

  const undoLastLog = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data: lastLog } = await supabase.from('water_logs').select('id, amount_oz').eq('user_id', user.id).eq('date', today).order('created_at', { ascending: false }).limit(1).single()
    if (!lastLog) { alert("Nothing to undo for today!"); return }
    if (!window.confirm(`Undo ${lastLog.amount_oz} oz?`)) return
    setTodayTotal(prev => prev - lastLog.amount_oz)
    const { error } = await supabase.from('water_logs').delete().eq('id', lastLog.id)
    if (error) setTodayTotal(prev => prev + lastLog.amount_oz)
    else { fetchData(); if (onUpdate) onUpdate() }
  }

  const saveBottleSize = async () => {
    await supabase.from('profiles').update({ bottle_capacity: bottleSize }).eq('id', user.id)
    setIsEditingBottle(false)
  }

  const progressPercent = Math.min((todayTotal / safeGoal) * 100, 100)
  const presets = [8, 12, 16, 24]

  // --- HARDCODED STYLES ---
  const styles = {
    card: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      minHeight: '450px',
      background: 'rgba(255, 255, 255, 0.03)', 
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
    },
    leftCol: {
      width: '40%',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)', 
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent', 
    },
    rightCol: {
      width: '60%',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '20px',
    },
    glassBtn: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      borderRadius: '16px',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, border 0.2s ease',
      color: 'white',
      height: '90px',
    },
    undoBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '20px',
      background: 'rgba(239, 68, 68, 0.1)', 
      border: '1px solid rgba(239, 68, 68, 0.2)',
      color: 'rgba(252, 165, 165, 0.9)', 
      fontSize: '10px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    bottleBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      borderRadius: '16px',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    },
    drinkBtn: {
      background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)', 
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '12px',
      fontWeight: '800',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    },
    sliderBox: {
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
    },
    glassAddBtn: {
      padding: '0 24px',
      height: '30px', 
      borderRadius: '12px',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '12px',
      fontWeight: '800',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeAddBtn: {
      background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
      border: 'none',
      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
    }
  }

  return (
    <div style={styles.card}>
      
      <style jsx>{`
            input[type=range] {
                -webkit-appearance: none;
                width: 100%;
                background: transparent;
                cursor: pointer;
            }
            input[type=range]::-webkit-slider-runnable-track {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
            }
            input[type=range]::-moz-range-track {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
            }
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #22d3ee;
                margin-top: -6px;
                box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
                border: 2px solid #0f172a;
            }
            input[type=range]::-moz-range-thumb {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #22d3ee;
                border: 2px solid #0f172a;
                box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
            }
      `}</style>
      
      {/* --- LEFT VISUALS --- */}
      <div style={styles.leftCol}>
         <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <Droplets size={20} className="text-cyan-400"/>
                Status
            </h2>
            <p className="text-cyan-200 text-base font-black uppercase tracking-widest mt-2">
                Goal: {safeGoal} oz
            </p>
         </div>

         <div className="w-full max-w-[200px] aspect-square relative">
             <WaveMeter percentage={progressPercent} label={`${todayTotal} oz`} />
         </div>
      </div>

      {/* --- RIGHT CONTROLS --- */}
      <div style={styles.rightCol}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-white/90 font-bold text-sm">
                <Zap size={16} className="text-yellow-400 fill-yellow-400"/>
                <span>Quick Add</span>
            </div>
            <button 
                onClick={undoLastLog} 
                style={styles.undoBtn}
                className="hover:bg-red-500/20 hover:text-red-200 active:scale-95"
            >
                <RotateCcw size={12} /> Undo
            </button>
        </div>

        {/* PRESETS */}
        <div className="grid grid-cols-4 gap-3">
            {presets.map(amount => (
                <button 
                    key={amount}
                    onClick={() => logWater(amount)}
                    style={styles.glassBtn}
                    className="hover:scale-[0.98] hover:border-cyan-400/30 group"
                >
                    <span className="text-3xl font-black text-white group-hover:text-cyan-200">{amount}</span>
                    <span className="text-[10px] uppercase text-white/30 font-bold tracking-wider group-hover:text-cyan-200/50">oz</span>
                </button>
            ))}
        </div>

        {/* SLIDER */}
        <div style={styles.sliderBox}>
             <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase mb-2">
                <span>Precision Amount</span>
                <span className="text-cyan-400">{sliderValue} oz</span>
             </div>
             
             <div className="flex gap-4 items-center">
                 <input 
                    type="range" min="0" max={50} 
                    value={sliderValue} 
                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                />
                <button 
                    disabled={sliderValue === 0}
                    onClick={() => { logWater(sliderValue); setSliderValue(0); }}
                    style={{
                        ...styles.glassAddBtn,
                        ...(sliderValue > 0 ? styles.activeAddBtn : {})
                    }}
                    className={sliderValue > 0 ? "hover:scale-105 active:scale-95" : "opacity-50 cursor-not-allowed"}
                >
                    Add
                </button>
             </div>
        </div>

        {/* BOTTLE */}
        <div className="mt-auto">
             {!isEditingBottle ? (
                <div style={styles.bottleBox} className="group hover:bg-white/10 transition cursor-pointer">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-emerald-400 bg-emerald-400/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <GlassWater size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-grow">
                        <div className="text-[10px] text-emerald-200/60 font-bold uppercase tracking-wider mb-0.5">My Bottle</div>
                        <div className="text-white font-black text-2xl leading-none">{bottleSize} <span className="text-sm text-white/30 font-medium">oz</span></div>
                    </div>
                    <button 
                        onClick={() => logWater(bottleSize)} 
                        style={styles.drinkBtn}
                        className="hover:scale-105 active:scale-95"
                    >
                        Drink
                    </button>
                    {/* UPDATED: Hardcoded color white on the icon */}
                    <button 
                        onClick={() => setIsEditingBottle(true)} 
                        style={{ background: 'transparent', border: 'none', padding: 0 }}
                        className="transition cursor-pointer ml-2 opacity-80 hover:opacity-100"
                    >
                        <Settings size={22} color="white" />
                    </button>
                </div>
             ) : (
                <div className="flex gap-3 items-center justify-between bg-black/30 p-4 rounded-xl border border-white/10">
                    <span className="text-xs font-bold text-white ml-2 uppercase tracking-wide">Bottle Size:</span>
                    <input 
                        type="number" value={bottleSize}
                        onChange={(e) => setBottleSize(parseInt(e.target.value))}
                        className="glass-input w-24 text-center py-2 font-bold text-xl bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500 focus:outline-none text-emerald-400"
                    />
                    <button 
                        onClick={saveBottleSize} 
                        className="text-xs bg-emerald-500 text-emerald-950 px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-400 transition uppercase tracking-wide"
                    >
                        Save
                    </button>
                </div>
             )}
        </div>
      </div>
    </div>
  )
}