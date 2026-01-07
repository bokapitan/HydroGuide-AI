'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function PaymentSuccess() {
  const router = useRouter()
  const [status, setStatus] = useState('loading') 

  useEffect(() => {
    async function upgradeUser() {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setStatus('error')
        return
      }

      // 2. Update DB to PRO
      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: true, theme_color: 'gold' }) 
        .eq('id', user.id)

      if (error) {
        console.error('Upgrade failed:', error)
        setStatus('error')
      } else {
        setStatus('success')
        // 3. Redirect home after 3 seconds
        setTimeout(() => router.push('/'), 3000)
      }
    }

    upgradeUser()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center backdrop-blur-xl">
        
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-slate-400">Please wait while we upgrade your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                You're a Pro!
            </h1>
            <p className="text-slate-300 mb-6">Thank you for supporting HydroGuide. Your premium features are now unlocked.</p>
            <button 
                onClick={() => router.push('/')}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold transition"
            >
                Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <div className="text-red-400">
            <h1 className="text-xl font-bold">Something went wrong.</h1>
            <p className="text-sm mt-2">Please contact support or try refreshing.</p>
            <button onClick={() => router.push('/')} className="mt-4 underline">Return Home</button>
          </div>
        )}

      </div>
    </div>
  )
}