'use client'

export default function WaveMeter({ percentage, label, color = 'cyan' }) {
  // 1. Force a clean number between 0 and 100
  const cleanPercent = typeof percentage === 'number' && !isNaN(percentage) 
    ? Math.min(Math.max(percentage, 0), 100) 
    : 0

  // 2. COLOR CONFIGURATION
  const colorMap = {
    cyan:   '#06b6d4', // Cyan-500
    gold:   '#fbbf24', // Amber-400
    purple: '#c084fc', // Purple-400
    red:    '#f87171', // Red-400
  }

  const activeColor = colorMap[color] || colorMap.cyan

  // Helper to generate the SVG Wave with the correct color
  // We encode the hex color (replace # with %23) so it works in a data URL
  const getWaveSVG = (hexColor) => {
    const encodedColor = hexColor.replace('#', '%23')
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='${encodedColor}'/%3E%3C/svg%3E")`
  }

  // 3. DEFINE STYLES
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
    // The rising water block
    waterContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: `${cleanPercent}%`,     // Dynamic Height
      backgroundColor: activeColor,   // DYNAMIC COLOR
      transition: 'height 0.5s ease-out, background-color 0.3s ease',
      zIndex: 1,
      boxShadow: `0 0 30px ${activeColor}66` // Add a subtle glow inside
    },
    // The Animated Wave on top
    wave: {
      position: 'absolute',
      top: '-28px',   // Overlap to hide seam
      left: 0,
      width: '200%',
      height: '40px',
      backgroundImage: getWaveSVG(activeColor), // DYNAMIC WAVE SVG
      backgroundSize: '50% 100%',
      backgroundRepeat: 'repeat-x',
      animation: 'wave-move 2s linear infinite',
      transition: 'background-image 0.3s ease'
    },
    text: {
      position: 'relative',
      zIndex: 10,
      color: 'white',
      fontWeight: '900',
      fontSize: '2.5rem', 
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

      {/* THE TEXT */}
      <div style={styles.text}>
        {label ? label : `${cleanPercent.toFixed(0)}%`}
      </div>
    </div>
  )
}