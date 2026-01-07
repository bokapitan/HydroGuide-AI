'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, Save, Activity, Thermometer, User, Calendar, Droplets, ChevronDown } from 'lucide-react'

export default function OnboardingForm({ user, initialData, onClose, onComplete }) {
  // --- SAFETY: Ensure we never read properties of null ---
  const safeData = initialData || {}

  // --- STATE ---
  const [age, setAge] = useState(safeData.age || '')
  const [gender, setGender] = useState(safeData.gender || 'Male')
  const [weight, setWeight] = useState(safeData.weight || '')
  // Default to 'sedentary' (0 extra) if nothing saved
  const [activityLevel, setActivityLevel] = useState(safeData.activity_level || 'sedentary')
  const [climate, setClimate] = useState(safeData.climate || 'temperate')
  const [loading, setLoading] = useState(false)

  // --- CALCULATE GOAL (Based on Flowchart) ---
  const calculateGoal = () => {
    const ageVal = parseInt(age) || 0
    const weightVal = parseFloat(weight) || 0
    let goal = 0

    // --- STEP 1: CHILD LOGIC (< 14 Years) ---
    // [cite: 29, 37, 41, 43]
    if (ageVal > 0 && ageVal < 14) {
        if (ageVal < 1) return 32       // [cite: 50]
        if (ageVal < 4) return 40       // [cite: 48]
        if (ageVal < 9) return 56       // [cite: 47]
        return 64                       // Standard for 9-13
    }

    // --- STEP 2: ADULT BASE LOGIC (>= 14 Years) ---
    // 
    if (gender === 'Male') {
        goal = weightVal * 0.67 // Male Multiplier [cite: 36]
    } else {
        goal = weightVal * 0.50 // Female/Other Multiplier [cite: 51]
    }

    // --- STEP 3: ACTIVITY ADD-ONS ---
    // [cite: 57, 60, 64, 68, 70, 71]
    switch (activityLevel) {
        case 'light':      goal += 6;  break; // [cite: 60]
        case 'moderate':   goal += 12; break; // [cite: 68] assuming diagram flow
        case 'high':       goal += 24; break; // [cite: 70]
        case 'extreme':    goal += 32; break; // [cite: 71]
        case 'sedentary':  goal += 0;  break; // Base
    }

    // --- STEP 4: CLIMATE ADD-ONS ---
    // [cite: 61, 74]
    if (climate === 'hot') {
        goal += 12 // "Tropical" adds 12 oz [cite: 74]
    }

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

    const { error } = await supabase
      .from('profiles')
      .upsert(updates) 

    setLoading(false)
    if (!error) {
      if (onComplete) onComplete() 
      else onClose()
    } else {
      alert('Error saving. Please verify "profiles" table has all columns (age, gender, etc).')
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
        overflowY: 'auto'
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
    // WRAPPER for custom Selects
    selectWrapper: {
        position: 'relative',
        width: '100%',
    },
    select: {
        width: '100%',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '14px',
        paddingRight: '40px', 
        borderRadius: '12px',
        color: 'white',
        fontSize: '16px',
        outline: 'none',
        cursor: 'pointer',
        // FORCE HIDE BROWSER ARROW
        appearance: 'none',
        MozAppearance: 'none',
        WebkitAppearance: 'none',
    },
    // CUSTOM ARROW ICON
    selectIcon: {
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none', // Allows clicking "through" the icon to the select
        color: '#22d3ee',      // Cyan-400 (Make it glow!)
        zIndex: 10,
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
      {onClose && (
        <button onClick={onClose} style={styles.closeBtn}>
            <X size={24} />
        </button>
      )}

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
                <div style={styles.selectWrapper}>
                    <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={styles.select}
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <ChevronDown size={20} style={styles.selectIcon} />
                </div>
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
        <div style={styles.selectWrapper}>
            <select 
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                style={styles.select}
            >
                <option value="sedentary">Sedentary (Base)</option>
                <option value="light">Light (+6 oz)</option>
                <option value="moderate">Moderate (+12 oz)</option>
                <option value="high">High (+24 oz)</option>
                <option value="extreme">Extreme (+32 oz)</option>
            </select>
            <ChevronDown size={20} style={styles.selectIcon} />
        </div>

        {/* ROW 4: Climate */}
        <label style={styles.label}>
            <Thermometer size={14} className="text-cyan-400" /> Environment
        </label>
        <div style={styles.selectWrapper}>
            <select 
                value={climate}
                onChange={(e) => setClimate(e.target.value)}
                style={styles.select}
            >
                <option value="temperate">Temperate (Average)</option>
                <option value="hot">Tropical / Hot (+12 oz)</option>
            </select>
            <ChevronDown size={20} style={styles.selectIcon} />
        </div>

        <button type="submit" style={styles.saveBtn} disabled={loading}>
            {loading ? 'Saving...' : <><Save size={20} /> Save & Calculate</>}
        </button>

      </form>
    </div>
  )
}