'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, Activity, Thermometer, Weight, User, Calendar, ChevronDown, ChevronUp, Check } from 'lucide-react'

// --- HELPER COMPONENT: CUSTOM GLASS DROPDOWN ---
function GlassDropdown({ label, icon: Icon, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedLabel = options.find(opt => opt.value === value)?.label || "Select..."

  const styles = {
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px',
        marginTop: '20px'
    },
    trigger: {
        width: '100%',
        padding: '14px',
        borderRadius: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: isOpen ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
        color: value ? 'white' : 'rgba(255,255,255,0.5)',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.2s'
    },
    menu: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        width: '100%',
        background: '#1e293b', 
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 50,
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.2s ease-out'
    },
    item: {
        padding: '12px 14px',
        color: 'white',
        fontSize: '15px',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
        <label style={styles.label}><Icon size={14} className="text-cyan-400"/> {label}</label>
        
        <div style={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
            <span>{selectedLabel}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : 'text-white/50'}`} />
        </div>

        {isOpen && (
            <div style={styles.menu}>
                {options.map((opt) => (
                    <div 
                        key={opt.value} 
                        style={styles.item}
                        className="hover:bg-white/10 transition-colors"
                        onClick={() => {
                            onChange(opt.value)
                            setIsOpen(false)
                        }}
                    >
                        {opt.label}
                        {value === opt.value && <Check size={14} className="text-cyan-400" />}
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}

// --- MAIN COMPONENT ---
export default function OnboardingForm({ user, onComplete, onClose, initialData = {} }) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    weight: initialData.weight || '',
    age: initialData.age || '',
    gender: initialData.gender || '',
    climate: initialData.climate || '',
    activity: initialData.activity_level || '' 
  })

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const adjustNumber = (field, amount) => {
    const currentValue = parseInt(formData[field]) || 0
    const newValue = Math.max(0, currentValue + amount)
    setFormData({ ...formData, [field]: newValue })
  }

  const calculateGoal = (weight, age, gender, climate, activity) => {
    let goalInOz = 0
    const w = parseFloat(weight)
    if (age >= 14) {
      if (gender === 'male') goalInOz = w * 0.67
      else goalInOz = w * 0.5
    } else {
      goalInOz = 32
    }
    if (activity === 'sedentary') goalInOz += 6
    if (activity === 'moderate') goalInOz += 12
    if (activity === 'active') goalInOz += 24
    if (climate === 'hot') goalInOz += 12
    return Math.round(goalInOz)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const dailyGoal = calculateGoal(formData.weight, formData.age, formData.gender, formData.climate, formData.activity)

    const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        weight: formData.weight,
        age: formData.age,
        gender: formData.gender,
        climate: formData.climate,
        activity_level: formData.activity,
        daily_goal_oz: dailyGoal,
        updated_at: new Date()
    })

    if (error) {
      alert('Error saving profile!')
    } else {
      onComplete() 
    }
    setLoading(false)
  }

  // --- STYLES ---
  const styles = {
    container: {
      width: '100%',
      maxWidth: '500px',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      borderRadius: '32px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '40px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      textAlign: 'left',
    },
    header: { textAlign: 'center', marginBottom: '10px' },
    headerRow: { display: 'flex', justifyContent: 'flex-end' },
    closeBtn: { color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none', cursor: 'pointer' },
    label: {
        display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)',
        fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', marginTop: '20px'
    },
    inputWrapper: { position: 'relative', width: '100%' },
    input: {
        width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '16px', outline: 'none',
        MozAppearance: 'textfield' 
    },
    spinners: { position: 'absolute', right: '4px', top: '4px', bottom: '4px', display: 'flex', flexDirection: 'column', gap: '2px' },
    spinBtn: {
        background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: 'rgba(255, 255, 255, 0.6)',
        borderRadius: '6px', padding: '0 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50%'
    },
    saveBtn: {
        width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        color: 'white', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)', marginTop: '40px', transition: 'transform 0.2s'
    },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }
  }

  return (
    <div style={styles.container}>
        <style jsx>{`
            /* Chrome, Safari, Edge, Opera */
            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button { 
                -webkit-appearance: none; 
                margin: 0; 
            }
            
            /* Firefox Specific Rule */
            input[type=number] {
                -moz-appearance: textfield;
            }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        
        <div style={styles.headerRow}>
            <button onClick={onClose} style={styles.closeBtn} className="hover:text-white"><X size={24} /></button>
        </div>

        <div style={styles.header}>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Update Settings</h2>
            <p className="text-white/50 text-sm">We'll calculate your ideal hydration based on your profile.</p>
        </div>
      
        <form onSubmit={handleSubmit}>
            
            {/* ROW 1: Numbers (Weight/Age) */}
            <div style={styles.row}>
                <div>
                    <label style={styles.label}><Weight size={14} className="text-cyan-400"/> Weight (lbs)</label>
                    <div style={styles.inputWrapper}>
                        <input type="number" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} style={styles.input} placeholder="160" />
                        <div style={styles.spinners}>
                            <button type="button" onClick={() => adjustNumber('weight', 1)} style={styles.spinBtn} className="hover:bg-white/10"><ChevronUp size={12} /></button>
                            <button type="button" onClick={() => adjustNumber('weight', -1)} style={styles.spinBtn} className="hover:bg-white/10"><ChevronDown size={12} /></button>
                        </div>
                    </div>
                </div>
                <div>
                    <label style={styles.label}><Calendar size={14} className="text-cyan-400"/> Age</label>
                    <div style={styles.inputWrapper}>
                        <input type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} style={styles.input} placeholder="25" />
                        <div style={styles.spinners}>
                            <button type="button" onClick={() => adjustNumber('age', 1)} style={styles.spinBtn} className="hover:bg-white/10"><ChevronUp size={12} /></button>
                            <button type="button" onClick={() => adjustNumber('age', -1)} style={styles.spinBtn} className="hover:bg-white/10"><ChevronDown size={12} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: Custom Dropdowns */}
            <div style={styles.row}>
                <GlassDropdown 
                    label="Gender" icon={User} value={formData.gender} onChange={(val) => handleChange('gender', val)}
                    options={[
                        { label: 'Male', value: 'male' },
                        { label: 'Female', value: 'female' }
                    ]}
                />
                <GlassDropdown 
                    label="Climate" icon={Thermometer} value={formData.climate} onChange={(val) => handleChange('climate', val)}
                    options={[
                        { label: 'Hot', value: 'hot' },
                        { label: 'Moderate', value: 'moderate' },
                        { label: 'Cold', value: 'cold' }
                    ]}
                />
            </div>

            {/* ROW 3: Activity Dropdown */}
            <GlassDropdown 
                label="Activity Level" icon={Activity} value={formData.activity} onChange={(val) => handleChange('activity', val)}
                options={[
                    { label: 'Sedentary (Light)', value: 'sedentary' },
                    { label: 'Moderate', value: 'moderate' },
                    { label: 'Active (High)', value: 'active' }
                ]}
            />

            <button type="submit" disabled={loading} style={styles.saveBtn} className="hover:scale-[1.02] active:scale-95">
                {loading ? 'Calculating...' : 'Recalculate Goal'}
            </button>
        </form>
    </div>
  )
}