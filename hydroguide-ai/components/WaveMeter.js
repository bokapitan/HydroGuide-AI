'use client'

export default function WaveMeter({ percentage, label }) {
  // 1. Force a clean number between 0 and 100
  const cleanPercent = typeof percentage === 'number' && !isNaN(percentage) 
    ? Math.min(Math.max(percentage, 0), 100) 
    : 0

  // 2. DEFINE STYLES
  const styles = {
    container: {
      width: '100%',
      height: '100%',
      backgroundColor: '#111827',     // Dark Gray
      border: '4px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',            // CIRCLE SHAPE
      overflow: 'hidden',             // Clip everything to circle
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)'
    },
    // The rising blue water block
    waterContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: `${cleanPercent}%`,     // Dynamic Height
      backgroundColor: '#06b6d4',     // Solid Cyan
      transition: 'height 0.5s ease-out',
      zIndex: 1
    },
    // The Animated Wave on top
    wave: {
      position: 'absolute',
      top: '-28px',   // Overlap to hide seam
      left: 0,
      width: '200%',
      height: '40px',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='%2306b6d4'/%3E%3C/svg%3E")`,
      backgroundSize: '50% 100%',
      backgroundRepeat: 'repeat-x',
      animation: 'wave-move 2s linear infinite'
    },
    text: {
      position: 'relative',
      zIndex: 10,
      color: 'white',
      fontWeight: '900',
      fontSize: '2.5rem', // Large readable text
      textShadow: '0 2px 5px rgba(0,0,0,0.3)', 
      pointerEvents: 'none'
    }
  }

  return (
    <div style={styles.container}>
      <style jsx>{`
        @keyframes wave-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* THE WATER */}
      <div style={styles.waterContainer}>
        <div style={styles.wave}></div>
      </div>

      {/* THE TEXT: Shows Label ("64 oz") if provided, otherwise Percentage */}
      <div style={styles.text}>
        {label ? label : `${cleanPercent.toFixed(0)}%`}
      </div>
    </div>
  )
}