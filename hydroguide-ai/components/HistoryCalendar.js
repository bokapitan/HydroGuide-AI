'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HistoryCalendar({ user, dailyGoal, refreshTrigger }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthlyStats, setMonthlyStats] = useState({})
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => { fetchMonthlyData() }, [currentDate, refreshTrigger])

  const fetchMonthlyData = async () => {
    const start = startOfMonth(currentDate).toISOString()
    const end = endOfMonth(currentDate).toISOString()
    const { data } = await supabase.from('water_logs').select('date, amount_oz, daily_goal').eq('user_id', user.id).gte('date', start).lte('date', end)
    
    if (data) {
      const stats = {}
      data.forEach(log => {
        if (!stats[log.date]) stats[log.date] = { total: 0, goal: log.daily_goal || dailyGoal }
        stats[log.date].total += log.amount_oz
      })
      setMonthlyStats(stats)
    }
  }

  const calendarDays = eachDayOfInterval({ 
      start: startOfWeek(startOfMonth(currentDate)), 
      end: endOfWeek(endOfMonth(startOfMonth(currentDate))) 
  })

  const getDayStatus = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    const dayData = monthlyStats[dateKey]
    if (!dayData) return 'no-data'
    if (dayData.total >= dayData.goal) return 'met'
    return 'missed'
  }

  return (
    <>
      <div className="w-full glass-card p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 text-white/70 hover:text-white transition"><ChevronLeft /></button>
            <h3 className="font-bold text-lg text-white tracking-wide">{format(currentDate, 'MMMM yyyy')}</h3>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 text-white/70 hover:text-white transition"><ChevronRight /></button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-cyan-200/50 uppercase">
            {['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const status = getDayStatus(day)
            const isCurrentMonth = isSameMonth(day, startOfMonth(currentDate))
            
            let bgClass = 'bg-white/5 hover:bg-white/10'
            let textClass = 'text-white/60'
            let borderClass = 'border-transparent'

            if (status === 'met') {
                bgClass = 'bg-emerald-400/20 hover:bg-emerald-400/30'
                textClass = 'text-emerald-200 font-bold'
                borderClass = 'border-emerald-400/50'
            } else if (status === 'missed') {
                bgClass = 'bg-amber-400/10 hover:bg-amber-400/20'
                textClass = 'text-amber-200'
                borderClass = 'border-amber-400/30'
            }
            if (!isCurrentMonth) { bgClass = 'opacity-0 pointer-events-none'; textClass = 'text-transparent'; borderClass='border-transparent' }

            return (
                <div 
                key={day.toString()}
                onClick={() => {
                    const stats = monthlyStats[dateKey]
                    setSelectedDay({ date: dateKey, total: stats ? stats.total : 0, goal: stats ? stats.goal : dailyGoal })
                }}
                className={`aspect-square rounded-full flex items-center justify-center cursor-pointer border ${borderClass} transition-all duration-300 ${bgClass} ${textClass}`}
                >
                <span className="text-xs">{format(day, 'd')}</span>
                </div>
            )
            })}
        </div>
      </div>

      {/* POPUP MODAL (MOVED OUTSIDE MAIN DIV) */}
      {selectedDay && (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedDay(null)}
        >
          <div 
            className="glass-card p-6 max-w-xs w-full text-center border-white/20 bg-slate-900/80 shadow-2xl transform scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-bold mb-2 text-white">{format(parseISO(selectedDay.date), 'EEEE, MMM do')}</h4>
            <div className="my-6">
              <div className="text-5xl font-black text-cyan-400 mb-2">{selectedDay.total}</div>
              <div className="text-blue-200 text-xs uppercase tracking-widest">Ounces Consumed</div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl mb-6 border border-white/10">
               <p className="text-sm text-gray-300">Goal: <strong>{selectedDay.goal} oz</strong></p>
               <p className={`font-bold mt-2 ${selectedDay.total >= selectedDay.goal ? 'text-emerald-400' : 'text-amber-400'}`}>
                 {selectedDay.total >= selectedDay.goal ? "🎉 Goal Met!" : `⚠️ ${selectedDay.goal - selectedDay.total} oz short`}
               </p>
            </div>
            <button onClick={() => setSelectedDay(null)} className="w-full glass-button py-3">Close</button>
          </div>
        </div>
      )}
    </>
  )
}