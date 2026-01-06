'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Auth from '../components/Auth'
import HydrationTracker from '../components/HydrationTracker'
import HistoryCalendar from '../components/HistoryCalendar'
import BottleRecommender from '../components/BottleRecommender' 
import OnboardingForm from '../components/OnboardingForm'
import { SlidersHorizontal, LogOut, X, Sparkles } from 'lucide-react'

export default function Home() {
  const [session, setSession] = useState(null)
  
  const [dailyGoal, setDailyGoal] = useState(100)
  const [userProfile, setUserProfile] = useState(null) 

  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0) 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
        setDailyGoal(data.daily_goal_oz || 100) 
        setUserProfile(data)
    }
  }

  if (!session) return <Auth />

  // --- STYLES ---
  const styles = {
    main: {
      minHeight: '100vh',
      background: 'transparent', // Let the global gradient show through
      padding: '40px 20px',
      fontFamily: 'sans-serif',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    header: {
      width: '100%',
      maxWidth: '1200px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
    },
    logo: {
      fontSize: '28px',
      fontWeight: '900',
      background: 'linear-gradient(to right, #22d3ee, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-1px',
    },
    signOutBtn: {
      padding: '8px 16px',
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.6)',
      fontSize: '12px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr', 
      gap: '24px',
      width: '100%',
      maxWidth: '1200px',
      alignItems: 'start',
      marginBottom: '50px'
    },
    leftColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    goalBtn: {
      width: '100%',
      padding: '24px',
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      color: 'white',
      fontSize: '14px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    },
    aiBtnContainer: {
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: '40px'
    },
    aiBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '18px 40px',
      borderRadius: '100px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '15px',
      fontWeight: 'bold',
      cursor: 'pointer',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease',
      letterSpacing: '0.5px'
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    }
  }

  return (
    <main style={styles.main}>
      
      <div style={styles.header}>
        <div style={styles.logo}>💧 HydroGuide</div>
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={styles.signOutBtn}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div style={styles.grid}>
        <div style={styles.leftColumn}>
          <HydrationTracker 
            user={session.user} 
            dailyGoal={dailyGoal} 
            onUpdate={() => setRefreshTrigger(prev => prev + 1)} 
          />

          <button 
            style={styles.goalBtn}
            onClick={() => setShowGoalModal(true)}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)'
                e.currentTarget.style.color = '#22d3ee'
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = 'white'
            }}
          >
            <SlidersHorizontal size={20} /> Adjust Goal Settings
          </button>
        </div>

        <div>
          <HistoryCalendar 
            user={session.user} 
            dailyGoal={dailyGoal} 
            refreshTrigger={refreshTrigger} 
          />
        </div>
      </div>

      <div style={styles.aiBtnContainer}>
        <button 
            onClick={() => setShowAI(true)}
            style={styles.aiBtn}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 0 25px rgba(6, 182, 212, 0.3)'
                e.currentTarget.style.borderColor = '#22d3ee'
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)'
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
            }}
        >
            <Sparkles size={20} className="text-cyan-400" />
            Get AI Bottle Recommendations
        </button>
      </div>

      {showAI && <BottleRecommender onClose={() => setShowAI(false)} profile={userProfile} />}
      
      {showGoalModal && (
        <div style={styles.overlay}>
          <OnboardingForm 
            user={session.user}
            initialData={userProfile}
            onClose={() => setShowGoalModal(false)}
            onComplete={() => {
                setShowGoalModal(false)
                fetchProfile(session.user.id) 
            }}
          />
        </div>
      )}

      <style jsx>{`
        @media (max-width: 1024px) {
            div[style*="display: grid"] {
                grid-template-columns: 1fr !important;
            }
        }
      `}</style>
    </main>
  )
}