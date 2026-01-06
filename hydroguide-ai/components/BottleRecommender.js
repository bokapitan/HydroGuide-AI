'use client'
import { useState, useEffect } from 'react'
import { X, Sparkles, ExternalLink } from 'lucide-react'

export default function BottleRecommender({ onClose, profile }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getRecommendations()
  }, [])

  const getRecommendations = async () => {
    try {
      const res = await fetch('/api/recommend-bottles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: profile?.daily_goal_oz || 100,
          activity: profile?.activity_level || 'moderate',
          climate: profile?.climate || 'temperate'
        })
      })
      
      const data = await res.json()
      if (data.recommendations) {
        setRecommendations(data.recommendations.slice(0, 3)) 
      } else {
        setError(true)
      }
    } catch (error) {
      console.error(error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const getGradient = (index) => {
    const gradients = [
      "from-blue-600 to-cyan-500",
      "from-purple-600 to-indigo-500",
      "from-emerald-500 to-teal-400"
    ]
    return gradients[index % gradients.length]
  }

  // --- STYLES ---
  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.9)', 
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    },
    card: {
      width: '95%',
      maxWidth: '1200px', 
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(24px)',
      borderRadius: '32px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '40px',
      boxShadow: '0 40px 80px rgba(0, 0, 0, 0.6)',
      position: 'relative',
      textAlign: 'center',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '10px',
        width: '100%',
    },
    glassCloseBtn: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
    },
    contentContainer: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBottom: '20px'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px', 
        padding: '60px 0'
    },
    spinnerBox: {
        position: 'relative',
        width: '100px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    recGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px',
        marginTop: '40px',
        alignItems: 'stretch',
    },
    recItem: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        height: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    },
    sizeBadge: {
        background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
        color: 'white',
        padding: '8px 20px',
        borderRadius: '100px',
        fontWeight: '900',
        fontSize: '16px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)',
        marginBottom: '10px'
    },
    amazonBtn: {
        width: '100%',
        marginTop: 'auto',
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
        color: '#451a03',
        fontWeight: 'bold',
        fontSize: '14px',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.25)',
        transition: 'transform 0.2s'
    }
  }

  return (
    <div style={styles.overlay} className="animate-in fade-in duration-300">
      <div style={styles.card} className="animate-in zoom-in-95 duration-300">
        
        {/* HEADER with Glass Close Button */}
        <div style={styles.headerRow}>
            <button 
                onClick={onClose}
                style={styles.glassCloseBtn}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.borderColor = 'white'
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
            >
                <X size={24} />
            </button>
        </div>

        <div style={styles.contentContainer}>
            {loading ? (
                // LOADING
                <div style={styles.loadingContainer}>
                    <div style={styles.spinnerBox}>
                        {/* Spinner Ring */}
                        <div className="absolute inset-0 rounded-full border-[6px] border-white/5 border-t-cyan-400 animate-spin"></div>
                        {/* Center Sparkle */}
                        <Sparkles size={40} className="text-cyan-400 animate-pulse relative z-10" />
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-white tracking-tight">Consulting AI...</h3>
                        <p className="text-white/40 text-lg">Analyzing your {profile?.daily_goal_oz}oz goal</p>
                    </div>
                </div>
            ) : error ? (
                // ERROR
                <div className="py-20">
                    <h3 className="text-2xl font-bold text-red-400 mb-2">Analysis Failed</h3>
                    <p className="text-white/50 mb-6 text-lg">We couldn't reach the AI right now.</p>
                </div>
            ) : (
                // SUCCESS
                <>
                    <div className="flex flex-col items-center gap-4 mb-4">
                        {/* CHANGED: Removed the circle container. Just the icon now. */}
                        <Sparkles size={56} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
                        
                        <h2 className="text-4xl font-black text-white tracking-tight">AI Recommended Gear</h2>
                    </div>
                    
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium">
                        Based on your goal, these bottles are optimized for your routine.
                    </p>

                    <div style={styles.recGrid}>
                        {recommendations.map((rec, i) => (
                            <div key={i} className="group hover:bg-white/10 hover:scale-[1.02] transition-all duration-300" style={styles.recItem}>
                                
                                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(i)} opacity-0 group-hover:opacity-10 transition duration-500`}></div>

                                {/* Header */}
                                <div className="text-center w-full">
                                    <h3 className="text-xl font-bold text-white mb-4 leading-tight min-h-[50px] flex items-center justify-center">
                                        {rec.name}
                                    </h3>
                                    
                                    <div style={styles.sizeBadge}>
                                        {rec.capacity}
                                    </div>
                                </div>
                                
                                {/* Reasoning */}
                                <p className="text-base text-white/70 leading-relaxed font-medium flex-grow py-4 border-t border-white/5 border-b border-white/5 w-full my-2">
                                    {rec.reason}
                                </p>

                                {/* Amazon Button */}
                                <a 
                                    href={rec.amazonUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={styles.amazonBtn}
                                    className="hover:scale-105 active:scale-95 group-hover:shadow-[0_4px_25px_rgba(251,191,36,0.5)]"
                                >
                                    Find on Amazon <ExternalLink size={18} />
                                </a>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  )
}