// components/OnboardingForm.js
'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function OnboardingForm({ user, onComplete }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    weight: '',
    age: '',
    gender: '',
    climate: '',
    activity: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const calculateGoal = (weight, age, gender, climate, activity) => {
    // --- YOUR ORIGINAL LOGIC FROM SCRIPT.JS ---
    let goalInOz = 0
    const w = parseFloat(weight)

    // A. Base Calculation
    if (age >= 14) {
      if (gender === 'male') {
        goalInOz = w * 0.67
      } else {
        goalInOz = w * 0.5
      }
    } else {
      goalInOz = 32 // Baseline for kids
    }

    // B. Activity Adjustment
    if (activity === 'sedentary') goalInOz += 6
    if (activity === 'moderate') goalInOz += 12
    if (activity === 'active') goalInOz += 24

    // C. Climate Adjustment
    if (climate === 'hot') goalInOz += 12

    return Math.round(goalInOz)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 1. Calculate the goal immediately
    const dailyGoal = calculateGoal(
      formData.weight,
      formData.age,
      formData.gender,
      formData.climate,
      formData.activity
    )

    // 2. Save everything to Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id, // This links the data to the logged-in user
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
      // Tell the main page we are done
      onComplete() 
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Let's set your goal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm font-bold mb-1">Weight (lbs)</label>
          <input type="number" name="weight" required min="50" max="500"
            className="w-full p-2 border rounded" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Age</label>
          <input type="number" name="age" required min="14" max="100"
            className="w-full p-2 border rounded" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Gender</label>
          <select name="gender" required className="w-full p-2 border rounded" onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Climate</label>
          <select name="climate" required className="w-full p-2 border rounded" onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="hot">Hot (Tropical)</option>
            <option value="moderate">Moderate</option>
            <option value="cold">Cold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Activity Level</label>
          <select name="activity" required className="w-full p-2 border rounded" onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="sedentary">Sedentary (Light)</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active (High)</option>
          </select>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
          {loading ? 'Saving...' : 'Calculate My Goal'}
        </button>
      </form>
    </div>
  )
}