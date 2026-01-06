// app/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import OnboardingForm from '../components/OnboardingForm'
import HydrationTracker from '../components/HydrationTracker'
import HistoryCalendar from '../components/HistoryCalendar'
import BottleRecommender from '../components/BottleRecommender'

export default function Home() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data) setProfile(data)
    } catch (error) {
      console.log('No profile found')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1)

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white animate-pulse">Loading HydroGuide...</div>

  return (
    // 1. OUTER CONTAINER: Full width, padding for breathing room
    <div className="min-h-screen w-full p-6 md:p-10">
      
      {/* 2. MAX WIDTH: Allows it to stretch to 1280px (7xl) for desktop dashboard feel */}
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center py-2">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-lg">
                  💧
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide">HydroGuide</h1>
          </div>
          {session && (
            <button 
              onClick={handleLogout} 
              className="text-sm font-semibold text-white/70 hover:text-white transition bg-white/10 px-5 py-2 rounded-full border border-white/5 hover:bg-white/20"
            >
              Sign Out
            </button>
          )}
        </header>

        {/* MAIN CONTENT AREA */}
        <main>
          {!session ? (
            // LOGIN SCREEN (Centered & Compact)
            <div className="max-w-md mx-auto mt-20">
                <div className="glass-card p-10 text-center border-t border-white/20">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-cyan-100/70 text-md mb-8 leading-relaxed">
                        Your personal AI hydration coach is ready.
                    </p>
                    <button onClick={handleLogin} className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
                        Sign in with Google
                    </button>
                </div>
            </div>
          ) : !profile || isEditing ? ( 
            // EDIT/ONBOARDING SCREEN (Centered & Compact)
            <div className="max-w-md mx-auto mt-10">
                <div className="glass-card p-8">
                {isEditing && (
                    <button onClick={() => setIsEditing(false)} className="mb-6 text-sm text-white/60 hover:text-white flex items-center gap-1 transition">
                        ← Cancel
                    </button>
                )}
                <OnboardingForm 
                    user={session.user} 
                    initialData={profile || {}} 
                    onComplete={() => { setIsEditing(false); fetchProfile(session.user.id) }} 
                />
                </div>
            </div>
          ) : (
            // DASHBOARD GRID
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
               
               {/* TOP ROW: TRACKER + CALENDAR (Side by Side on Desktop) */}
               <div className="grid grid-cols-1 grid-cols-2 gap-6 items-start">
                   
                   {/* LEFT: Tracker */}
                   <div className="h-full">
                        <HydrationTracker 
                            user={session.user} 
                            dailyGoal={profile.daily_goal_oz} 
                            onUpdate={triggerRefresh} 
                        />
                   </div>

                   {/* RIGHT: Calendar */}
                   <div className="h-full">
                        <HistoryCalendar 
                            user={session.user} 
                            dailyGoal={profile.daily_goal_oz} 
                            refreshTrigger={refreshTrigger}
                        />
                   </div>
               </div>

               {/* BOTTOM ROW: AI Recommendations (Full Width) */}
               <div className="w-full">
                   <div className="glass-card p-6"> 
                        <BottleRecommender profile={profile} />
                   </div>
               </div>

               {/* Footer Edit Link */}
               <div className="text-center pt-4 pb-8">
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-medium text-white/30 hover:text-white/80 transition-colors uppercase tracking-widest"
                  >
                    Adjust Goal Settings
                  </button>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}