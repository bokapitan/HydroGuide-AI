'use client'

export default function WaveMeter({ percentage, amount, dailyGoal }) {
  const visualPercent = Math.min(Math.max(percentage, 0), 100)
  
  return (
    <div className="relative w-56 h-56 mx-auto my-8 flex items-center justify-center">
      
      {/* 1. OUTER GLOW RING */}
      <div className="absolute inset-0 rounded-full border-4 border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.3)] pointer-events-none"></div>

      {/* 2. THE WAVE MASK */}
      <div className="relative w-48 h-48 rounded-full bg-slate-900/50 overflow-hidden border border-white/10 isolate mask-circle">
        <div 
           className="absolute bottom-0 left-0 w-[200%] h-[200%] bg-gradient-to-t from-cyan-500 to-blue-500 transition-all duration-1000 ease-out"
           style={{ 
             transform: `translateY(${100 - visualPercent}%) translateX(-25%) rotate(0deg)`,
             borderRadius: '40%'
           }}
        >
             <div className="animate-spin-slow w-full h-full rounded-[40%] bg-gradient-to-t from-cyan-400 to-blue-600 opacity-80 blur-sm"></div>
        </div>
      </div>

      {/* 3. TEXT OVERLAY (Strictly Centered) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 drop-shadow-lg pointer-events-none">
        <div className="flex items-baseline">
            <span className="text-5xl font-bold text-white tracking-tighter">
            {amount}
            </span>
            <span className="text-lg font-medium text-cyan-200 ml-1">oz</span>
        </div>
        
        <div className="h-px w-12 bg-white/20 my-1"></div>
        
        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
          of {dailyGoal}
        </span>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}