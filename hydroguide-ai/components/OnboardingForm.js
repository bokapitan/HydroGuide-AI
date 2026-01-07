'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, Save, Activity, Thermometer, User } from 'lucide-react'

export default function OnboardingForm({ user, initialData, onClose, onComplete }) {
  // --- SAFETY FIX: Default to empty object if initialData is null ---
  const safeData = initialData || {}

  const [weight, setWeight] = useState(safeData.weight || '')
  const [activityLevel, setActivityLevel] = useState(safeData.activity_level || 'moderate')
  const [climate, setClimate] = useState(safeData.climate || 'temperate')
  const [loading, setLoading] = useState(false)

  const calculateGoal = () => {
    const w = parseFloat(weight) || 150
    let goal = w * 0.5 // Baseline: 0.5 oz per lb

    if (activityLevel === 'high') goal += 20
    if (activityLevel === 'low') goal -= 10
    
    if (climate === 'hot') goal += 15
    if (climate === 'cold') goal -= 5

    return Math.round(goal)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)

    const recommendedGoal = calculateGoal()

    const updates = {
      id: user.id,
      weight: parseFloat(weight) || 0,
      activity_level: activityLevel,
      climate: climate,
      daily_goal_oz: recommendedGoal,
      updated_at: new Date()
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(updates) // .upsert() will create the row if it's missing!

    setLoading(false)
    if (!error) {
      if (onComplete) onComplete()
      else onClose()
    } else {
      alert('Error saving profile!')
      console.error(error)
    }
  }

  // --- STYLES ---
  const styles = {
    container: {
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        position: 'relative'
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#94a3b8',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    input: {
        width: '100%',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '16px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '16px',
        marginBottom: '24px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    select: {
        width: '100%',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '16px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '16px',
        marginBottom: '24px',
        outline: 'none',
        appearance: 'none', 
        cursor: 'pointer'
    },
    saveBtn: {
        width: '100%',
        padding: '16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        color: 'white',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '10px'
    },
    closeBtn: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
    }
  }

  return (
    <div style={styles.container}>
      <button onClick={onClose} style={styles.closeBtn}>
        <X size={24} />
      </button>

      <h2 className="text-2xl font-black text-white mb-6 text-center">Personalize Your Plan</h2>

      <form onSubmit={handleSave}>
        
        {/* WEIGHT INPUT */}
        <label style={styles.label}>
            <User size={16} className="text-cyan-400" /> Weight (lbs)
        </label>
        <input 
            type="number" 
            placeholder="e.g. 160"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={styles.input}
            required
            onFocus={(e) => e.target.style.borderColor = '#22d3ee'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />

        {/* ACTIVITY LEVEL */}
        <label style={styles.label}>
            <Activity size={16} className="text-cyan-400" /> Activity Level
        </label>
        <div className="relative">
            <select 
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                style={styles.select}
                onFocus={(e) => e.target.style.borderColor = '#22d3ee'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
                <option value="low">Low (Sedentary)</option>
                <option value="moderate">Moderate (Light Exercise)</option>
                <option value="high">High (Athlete/Active Job)</option>
            </select>
        </div>

        {/* CLIMATE */}
        <label style={styles.label}>
            <Thermometer size={16} className="text-cyan-400" /> Environment
        </label>
        <div className="relative">
            <select 
                value={climate}
                onChange={(e) => setClimate(e.target.value)}
                style={styles.select}
                onFocus={(e) => e.target.style.borderColor = '#22d3ee'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
                <option value="temperate">Temperate (Average)</option>
                <option value="hot">Hot / Humid</option>
                <option value="cold">Cold / Dry</option>
            </select>
        </div>

        <button type="submit" style={styles.saveBtn} disabled={loading}>
            {loading ? 'Saving...' : <><Save size={20} /> Save & Calculate Goal</>}
        </button>

      </form>
    </div>
  )
}