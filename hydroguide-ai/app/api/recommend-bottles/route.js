// app/api/recommend-bottles/route.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {



      // 1. Check for API Key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY is missing from environment variables." },
          { status: 500 }
        );
      }



    const { activity, climate, goal } = await req.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
      Act as a hydration expert. Recommend 3 specific types of water bottles for a user with these stats:
      - Daily Water Goal: ${goal} oz
      - Activity Level: ${activity}
      - Climate: ${climate}

      For each recommendation, provide:
      1. An informative name for the bottle
      2. The ideal capacity (e.g., 32oz).
      3. A short reason why it fits.
      4. A precise Amazon search keywords string (e.g., "Yeti Rambler 26oz insulated").

      Return the response ONLY as a valid JSON array:
      [
        { "name": "...", "capacity": "...", "reason": "...", "searchTerm": "..." }
      ]
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    const cleanJson = text.replace(/```json|```/g, '').trim()
    
    let recommendations = JSON.parse(cleanJson)

    // SERVER-SIDE PROCESSING: Create the "Premade Link" here
    recommendations = recommendations.map(rec => ({
      ...rec,
      amazonUrl: `https://www.amazon.com/s?k=${encodeURIComponent(rec.searchTerm)}`
    }))

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('Gemini API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}