// app/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import OnboardingForm from '../components/OnboardingForm'

export default function Home() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Get Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // 2. Listen for auth changes
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

  // Helper: Fetch Profile from Supabase
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single() // We expect only one profile per user

      if (data) setProfile(data)
    } catch (error) {
      console.log('No profile found, user needs to onboard.')
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

  if (loading) return <div className="text-center mt-20">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8 py-4">
        <h1 className="text-3xl font-bold text-blue-600">💧 HydroGuide AI</h1>
        {session && (
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">
            Sign Out
          </button>
        )}
      </header>

      <main className="w-full max-w-md">
        {!session ? (
          // STATE 1: NOT LOGGED IN
          <div className="bg-white p-8 rounded shadow text-center">
            <p className="mb-6">Sign in to track your personalized hydration.</p>
            <button onClick={handleLogin} className="w-full bg-blue-500 text-white font-bold py-3 rounded">
              Sign in with Google
            </button>
          </div>
        ) : !profile ? (
          // STATE 2: LOGGED IN, BUT NO PROFILE (Onboarding)
          <OnboardingForm user={session.user} onComplete={() => fetchProfile(session.user.id)} />
        ) : (
          // STATE 3: LOGGED IN & HAS PROFILE (Dashboard)
          <div className="bg-white p-8 rounded shadow text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
            <div className="my-6 p-6 bg-blue-100 rounded-full w-48 h-48 flex flex-col items-center justify-center mx-auto border-4 border-blue-200">
              <span className="text-gray-600 text-sm uppercase font-bold">Daily Goal</span>
              <span className="text-4xl font-black text-blue-700">{profile.daily_goal_oz} oz</span>
            </div>
            <p className="text-gray-500">
              Your profile is active. (Tracking calendar coming next!)
            </p>
          </div>
        )}
      </main>
    </div>
  )
}