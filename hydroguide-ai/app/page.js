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
    // OUTER WRAPPER: Handles the background and padding
    <div className="min-h-screen w-full p-4 md:p-8">
      
      {/* PHONE CONTAINER: Strictly limits width to 400px and centers it (mx-auto) */}
      <div className="mx-auto w-full max-w-[400px] flex flex-col gap-6">
        
        {/* HEADER */}
        <header className="flex justify-between items-center py-2">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-lg">
                  💧
              </div>
              <h1 className="text-xl font-bold text-white tracking-wide">HydroGuide</h1>
          </div>
          {session && (
            <button 
              onClick={handleLogout} 
              className="text-xs font-semibold text-white/70 hover:text-white transition bg-white/10 px-4 py-2 rounded-full border border-white/5 hover:bg-white/20"
            >
              Sign Out
            </button>
          )}
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="space-y-6">
          {!session ? (
            // STATE 1: LOGIN
            <div className="glass-card p-8 text-center border-t border-white/20">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-cyan-100/70 text-sm mb-8 leading-relaxed">
                Your personal AI hydration coach is ready.
              </p>
              <button 
                onClick={handleLogin} 
                className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
              >
                Sign in with Google
              </button>
            </div>
          ) : !profile || isEditing ? ( 
            // STATE 2: ONBOARDING / EDIT
            <div className="glass-card p-6">
              {isEditing && (
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="mb-6 text-sm text-white/60 hover:text-white flex items-center gap-1 transition"
                  >
                      ← Cancel
                  </button>
              )}
              <OnboardingForm 
                  user={session.user} 
                  initialData={profile || {}} 
                  onComplete={() => {
                      setIsEditing(false)
                      fetchProfile(session.user.id) 
                  }} 
              />
            </div>
          ) : (
            // STATE 3: DASHBOARD
            <>
               <HydrationTracker 
                  user={session.user} 
                  dailyGoal={profile.daily_goal_oz} 
                  onUpdate={triggerRefresh} 
               />

               <HistoryCalendar 
                  user={session.user} 
                  dailyGoal={profile.daily_goal_oz} 
                  refreshTrigger={refreshTrigger}
               />

               <div className="opacity-90 hover:opacity-100 transition duration-300">
                   <BottleRecommender profile={profile} />
               </div>

               {/* Edit Link */}
               <div className="text-center pt-4">
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-medium text-white/30 hover:text-white/80 transition-colors uppercase tracking-widest"
                  >
                    Adjust Goal Settings
                  </button>
               </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}