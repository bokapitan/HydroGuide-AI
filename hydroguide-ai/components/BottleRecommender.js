// components/BottleRecommender.js
'use client'
import { useState } from 'react'

export default function BottleRecommender({ profile }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const getRecommendations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/recommend-bottles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: profile.daily_goal_oz,
          activity: profile.activity_level,
          climate: profile.climate
        })
      })
      
      const data = await res.json()
      if (data.recommendations) {
        setRecommendations(data.recommendations)
        setHasFetched(true)
      }
    } catch (error) {
      console.error(error)
      alert('Failed to get recommendations from AI')
    } finally {
      setLoading(false)
    }
  }

  if (hasFetched) {
    return (
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
        <h3 className="text-xl font-bold text-purple-700 mb-4 text-center">🤖 AI Recommended Gear</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition flex flex-col h-full">
              <div className="mb-2">
                <h4 className="font-bold text-lg text-gray-800 leading-tight">{rec.name}</h4>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1 font-semibold">
                  {rec.capacity}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 flex-grow">{rec.reason}</p>
              
              <a 
                href={rec.amazonUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 rounded text-sm transition-colors mt-auto"
              >
                Find on Amazon ↗
              </a>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setHasFetched(false)} 
          className="block w-full text-center mt-6 text-sm text-gray-400 underline hover:text-gray-600"
        >
          Close Recommendations
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 text-center">
      <button 
        onClick={getRecommendations} 
        disabled={loading}
        className="bg-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-purple-700 transition flex items-center justify-center mx-auto gap-2"
      >
        {loading ? (
          <span>Asking Gemini... ✨</span>
        ) : (
          <span>✨ Get AI Bottle Recommendations</span>
        )}
      </button>
    </div>
  )
}