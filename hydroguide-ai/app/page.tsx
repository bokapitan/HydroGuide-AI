// app/page.js
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient' // This points to your new file

export default function Home() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Listen for login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">💧 HydroGuide AI</h1>
        <p className="text-gray-600">Your personalized hydration assistant.</p>
      </header>

      <main className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {!session ? (
          // NOT LOGGED IN
          <div>
            <p className="mb-6 text-gray-700">
              Please sign in to calculate your personalized water goal.
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition duration-300"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          // LOGGED IN
          <div>
            <p className="mb-4 text-green-600 font-semibold">
              Welcome back, {session.user.user_metadata.full_name}!
            </p>
            <button
              onClick={handleLogout}
              className="w-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-bold py-2 px-4 rounded transition duration-300"
            >
              Sign Out
            </button>
          </div>
        )}
      </main>
    </div>
  )
}