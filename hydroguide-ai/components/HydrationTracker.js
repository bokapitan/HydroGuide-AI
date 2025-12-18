// components/HydrationTracker.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function HydrationTracker({ user, dailyGoal }) {
  const [todayTotal, setTodayTotal] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // When the component loads, fetch the data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // 1. Get today's logs to calculate the total
    const { data: todayLogs, error: todayError } = await supabase
      .from('water_logs')
      .select('amount_oz')
      .eq('user_id', user.id)
      .eq('date', today)

    if (todayLogs) {
      const total = todayLogs.reduce((sum, log) => sum + log.amount_oz, 0)
      setTodayTotal(total)
    }

    // 2. Get the last 7 days for the history/calendar view
    const { data: pastLogs, error: historyError } = await supabase
      .from('water_logs')
      .select('date, amount_oz')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(20) // Just grab the last 20 logs for now

    if (pastLogs) {
      // Group logs by date
      const historyMap = {}
      pastLogs.forEach(log => {
        if (!historyMap[log.date]) historyMap[log.date] = 0
        historyMap[log.date] += log.amount_oz
      })
      setHistory(historyMap)
    }
    setLoading(false)
  }

  const addWater = async (amount) => {
    const today = new Date().toISOString().split('T')[0]

    // Optimistic UI: Update the number immediately so it feels fast
    setTodayTotal(prev => prev + amount)

    // Save to Supabase
    const { error } = await supabase
      .from('water_logs')
      .insert({
        user_id: user.id,
        date: today,
        amount_oz: amount
      })

    if (error) {
      console.error('Error logging water:', error)
      alert('Failed to save water log!')
      // Rollback if it failed
      setTodayTotal(prev => prev - amount)
    } else {
      // Refresh history to keep the calendar in sync
      fetchData()
    }
  }

  // Calculate Progress Percentage (capped at 100% for the bar width)
  const progressPercent = Math.min((todayTotal / dailyGoal) * 100, 100)

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      
      {/* --- SECTION 1: TODAY'S PROGRESS --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 text-center">
        <h2 className="text-gray-500 font-bold uppercase text-sm mb-2">Today's Hydration</h2>
        
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <span className="text-3xl font-black text-blue-600">{todayTotal} oz</span>
            <span className="text-sm font-semibold text-gray-400"> / {dailyGoal} oz Goal</span>
          </div>
          
          {/* Progress Bar */}
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-blue-100">
            <div 
              style={{ width: `${progressPercent}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
            ></div>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <button onClick={() => addWater(8)} className="py-3 px-4 bg-blue-50 text-blue-600 font-bold rounded hover:bg-blue-100 transition border border-blue-200">+8 oz</button>
          <button onClick={() => addWater(16)} className="py-3 px-4 bg-blue-50 text-blue-600 font-bold rounded hover:bg-blue-100 transition border border-blue-200">+16 oz</button>
          <button onClick={() => addWater(32)} className="py-3 px-4 bg-blue-50 text-blue-600 font-bold rounded hover:bg-blue-100 transition border border-blue-200">+32 oz</button>
        </div>
      </div>

      {/* --- SECTION 2: HISTORY / CALENDAR --- */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h3 className="text-gray-700 font-bold mb-4 border-b pb-2">Recent History</h3>
        {loading ? (
          <p>Loading history...</p>
        ) : Object.keys(history).length === 0 ? (
          <p className="text-gray-400 text-sm">No history yet. Drink some water!</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(history).map(([date, total]) => (
              <div key={date} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{date}</span>
                <span className={`font-bold ${total >= dailyGoal ? 'text-green-500' : 'text-orange-400'}`}>
                  {total} oz
                  {total >= dailyGoal && ' ✅'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  )
}