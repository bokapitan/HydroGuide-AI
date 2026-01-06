// components/OnboardingForm.js
'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function OnboardingForm({ user, onComplete, initialData = {} }) {
  const [loading, setLoading] = useState(false)
  
  // PRE-FILL LOGIC: Use existing data if we have it, otherwise empty strings
  const [formData, setFormData] = useState({
    weight: initialData.weight || '',
    age: initialData.age || '',
    gender: initialData.gender || '',
    climate: initialData.climate || '',
    activity: initialData.activity_level || '' // Note: DB column is activity_level
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const calculateGoal = (weight, age, gender, climate, activity) => {
    let goalInOz = 0
    const w = parseFloat(weight)

    // Base Calculation
    if (age >= 14) {
      if (gender === 'male') goalInOz = w * 0.67
      else goalInOz = w * 0.5
    } else {
      goalInOz = 32
    }

    // Adjustments
    if (activity === 'sedentary') goalInOz += 6
    if (activity === 'moderate') goalInOz += 12
    if (activity === 'active') goalInOz += 24
    if (climate === 'hot') goalInOz += 12

    return Math.round(goalInOz)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const dailyGoal = calculateGoal(
      formData.weight,
      formData.age,
      formData.gender,
      formData.climate,
      formData.activity
    )

    const { error } = await supabase
      .from('profiles')
      .upsert({
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
      console.error(error)
    } else {
      onComplete() 
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
        {initialData.weight ? "Update your settings" : "Let's set your goal"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Weight (lbs)</label>
          <input type="number" name="weight" required min="50" max="500"
            value={formData.weight}
            className="w-full p-2 border rounded" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Age</label>
          <input type="number" name="age" required min="14" max="100"
            value={formData.age}
            className="w-full p-2 border rounded" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Gender</label>
          <select name="gender" required className="w-full p-2 border rounded" value={formData.gender} onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Climate</label>
          <select name="climate" required className="w-full p-2 border rounded" value={formData.climate} onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="hot">Hot (Tropical)</option>
            <option value="moderate">Moderate</option>
            <option value="cold">Cold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Activity Level</label>
          <select name="activity" required className="w-full p-2 border rounded" value={formData.activity} onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="sedentary">Sedentary (Light)</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active (High)</option>
          </select>
        </div>

        <div className="flex gap-2">
            {/* If canceling an edit, we might want a cancel button, but for now just Save is fine */}
            <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
            {loading ? 'Saving...' : 'Recalculate Goal'}
            </button>
        </div>
      </form>
    </div>
  )
}