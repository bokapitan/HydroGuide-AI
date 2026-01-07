'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, Save, Activity, Thermometer, User, Calendar, Droplets } from 'lucide-react'

export default function OnboardingForm({ user, initialData, onClose, onComplete }) {
  // --- SAFETY CHECK: Handle null data for new users ---
  const safeData = initialData || {}

  // --- STATE ---
  const [age, setAge] = useState(safeData.age || '')
  const [gender, setGender] = useState(safeData.gender || 'Male')
  const [weight, setWeight] = useState(safeData.weight || '')
  const [activityLevel, setActivityLevel] = useState(safeData.activity_level || 'moderate')
  const [climate, setClimate] = useState(safeData.climate || 'temperate')
  const [loading, setLoading] = useState(false)

  // --- CALCULATE GOAL ---
  const calculateGoal = () => {
    // Base: 0.5 oz per lb of body weight
    const w = parseFloat(weight) || 150
    let goal = w * 0.5 

    // Activity Adjustments
    if (activityLevel === 'high') goal += 20 // Heavy exercise
    if (activityLevel === 'moderate') goal += 10 // Light exercise
    
    // Climate Adjustments
    if (climate === 'hot') goal += 15 // Sweating more
    if (climate === 'cold') goal -= 5 // Less evaporation, though still need hydration
    
    // Age Adjustments (Metabolism slows slightly with age)
    const a = parseInt(age) || 30
    if (a > 55) goal *= 0.95 

    // Gender Adjustments (Men typically have higher muscle mass = more water)
    if (gender === 'Male') goal += 5
    if (gender === 'Female') goal -= 5

    return Math.round(goal)
  }

  // --- SAVE TO DB ---
  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)

    const recommendedGoal = calculateGoal()

    const updates = {
      id: user.id,
      age: parseInt(age) || 0,
      gender: gender,
      weight: parseFloat(weight) || 0,
      activity_level: activityLevel,
      climate: climate,
      daily_goal_oz: recommendedGoal,
      updated_at: new Date()
    }

    // .upsert() creates the row if it doesn't exist, or updates it if it does
    const { error } = await supabase
      .from('profiles')
      .upsert(updates) 

    setLoading(false)
    if (!error) {
      if (onComplete) onComplete() // Refresh parent data
      else onClose()
    } else {
      alert('Error saving profile! Check if "age" and "gender" columns exist in Supabase.')
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
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto' // Scroll if screen is short
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#94a3b8',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginTop: '16px'
    },
    input: {
        width: '100%',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '14px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '16px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    select: {
        width: '100%',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '14px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '16px',
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
        marginTop: '30px'
    },
    closeBtn: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
    },
    row: {
        display: 'flex',
        gap: '16px',
    },
    col: {
        flex: 1
    }
  }

  return (
    <div style={styles.container}>
      <button onClick={onClose} style={styles.closeBtn}>
        <X size={24} />
      </button>

      <h2 className="text-2xl font-black text-white mb-2 text-center">Setup Profile</h2>
      <p className="text-slate-400 text-center text-sm mb-6">Let's calculate your ideal hydration goal.</p>

      <form onSubmit={handleSave}>
        
        {/* ROW 1: Age & Gender */}
        <div style={styles.row}>
            <div style={styles.col}>
                <label style={styles.label}>
                    <Calendar size={14} className="text-cyan-400" /> Age
                </label>
                <input 
                    type="number" 
                    placeholder="30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={styles.input}
                    required
                />
            </div>
            <div style={styles.col}>
                <label style={styles.label}>
                    <Droplets size={14} className="text-cyan-400" /> Gender
                </label>
                <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={styles.select}
                >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>

        {/* ROW 2: Weight */}
        <label style={styles.label}>
            <User size={14} className="text-cyan-400" /> Weight (lbs)
        </label>
        <input 
            type="number" 
            placeholder="e.g. 160"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={styles.input}
            required
        />

        {/* ROW 3: Activity Level */}
        <label style={styles.label}>
            <Activity size={14} className="text-cyan-400" /> Activity Level
        </label>
        <select 
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            style={styles.select}
        >
            <option value="low">Low (Sedentary)</option>
            <option value="moderate">Moderate (Light Exercise)</option>
            <option value="high">High (Athlete/Active Job)</option>
        </select>

        {/* ROW 4: Climate */}
        <label style={styles.label}>
            <Thermometer size={14} className="text-cyan-400" /> Environment
        </label>
        <select 
            value={climate}
            onChange={(e) => setClimate(e.target.value)}
            style={styles.select}
        >
            <option value="temperate">Temperate (Average)</option>
            <option value="hot">Hot / Humid</option>
            <option value="cold">Cold / Dry</option>
        </select>

        <button type="submit" style={styles.saveBtn} disabled={loading}>
            {loading ? 'Saving...' : <><Save size={20} /> Save & Calculate</>}
        </button>

      </form>
    </div>
  )
}