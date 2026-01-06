'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import WaveMeter from './WaveMeter'
import { RotateCcw, Settings, Plus, Droplets } from 'lucide-react'

export default function HydrationTracker({ user, dailyGoal, onUpdate }) {
  const [todayTotal, setTodayTotal] = useState(0)
  const [sliderValue, setSliderValue] = useState(8)
  const [bottleSize, setBottleSize] = useState(0) 
  const [isEditingBottle, setIsEditingBottle] = useState(false) 

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

    const { error } = await supabase.from('water_logs').insert({
        user_id: user.id, date: today, amount_oz: amount, daily_goal: dailyGoal
    })

    if (error) {
      setTodayTotal(prev => prev - amount)
    } else {
      fetchData(); if (onUpdate) onUpdate()
    }
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

  const progressPercent = Math.min((todayTotal / dailyGoal) * 100, 100)

  return (
    // Added 'flex flex-col' and specific padding/gap to prevent squashing
    <div className="w-full glass-card p-6 flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-cyan-100 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
           <Droplets size={14} className="text-cyan-400" /> Today's Hydration
        </h2>
        <button onClick={undoLastLog} className="text-white/50 hover:text-white transition p-1 rounded-full hover:bg-white/10" title="Undo">
            <RotateCcw size={16} />
        </button>
      </div>

      {/* METER - Added margins to separate it from header/footer */}
      <div className="my-2 scale-90 sm:scale-100"> 
          <WaveMeter percentage={progressPercent} amount={todayTotal} dailyGoal={dailyGoal} />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col gap-4">
        
        {/* SLIDER CARD */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
          <div className="flex justify-between text-white text-sm font-semibold mb-3">
            <span>Quick Add</span>
            <span className="text-cyan-300">{sliderValue} oz</span>
          </div>
          
          <input 
            type="range" min="1" max={dailyGoal} 
            value={sliderValue} 
            onChange={(e) => setSliderValue(parseInt(e.target.value))}
            className="w-full mb-4 accent-cyan-400"
          />
          
          <button 
            onClick={() => logWater(sliderValue)}
            className="w-full glass-button py-3 flex items-center justify-center gap-2 text-white hover:bg-white/10"
          >
            <Plus size={18} /> Add {sliderValue} oz
          </button>
        </div>

        {/* BOTTLE BUTTON */}
        {!isEditingBottle ? (
            <div className="flex gap-2">
            <button 
                onClick={() => logWater(bottleSize)}
                className="flex-grow h-12 bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg border border-white/10 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
                <span className="text-lg">🥤</span> Drink Bottle ({bottleSize}oz)
            </button>
            <button 
                onClick={() => setIsEditingBottle(true)}
                className="w-12 h-12 glass-button flex items-center justify-center text-white/60 hover:text-white"
            >
                <Settings size={20} />
            </button>
            </div>
        ) : (
            <div className="flex gap-2 items-center justify-between bg-slate-900/40 p-2 rounded-xl border border-white/5 h-12">
                <span className="text-sm font-bold text-white ml-2">Size:</span>
                <input 
                    type="number" value={bottleSize}
                    onChange={(e) => setBottleSize(parseInt(e.target.value))}
                    className="glass-input w-20 text-center py-1 h-8"
                />
                <button onClick={saveBottleSize} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold">Save</button>
            </div>
        )}
      </div>
    </div>
  )
}