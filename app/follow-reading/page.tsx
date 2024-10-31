'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'

interface Word {
  id: number
  word: string
  phonetic: string
  explanation: string
  example: string
}

const sampleWords: Word[] = [
  {
    id: 1,
    word: "Serendipity",
    phonetic: "/ˌserənˈdɪpəti/",
    explanation: "The occurrence and development of events by chance in a happy or beneficial way",
    example: "The discovery of penicillin was a serendipity"
  },
  {
    id: 2,
    word: "Ethereal",
    phonetic: "/iˈθɪriəl/",
    explanation: "Extremely delicate and light in a way that seems not to be of this world",
    example: "An ethereal beauty"
  },
  {
    id: 3,
    word: "Mellifluous",
    phonetic: "/məˈlɪfluəs/",
    explanation: "Sweet or musical; pleasant to hear",
    example: "Her mellifluous voice"
  },
  {
    id: 4,
    word: "Ephemeral",
    phonetic: "/əˈfem(ə)rəl/",
    explanation: "Lasting for a very short time",
    example: "Ephemeral pleasures"
  },
]

export default function FollowReadingPage() {
  const { theme } = useTheme()
  const [displayCount, setDisplayCount] = useState(4)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Word List */}
          <div className="w-full md:w-1/3">
            <div className="instagram-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold gradient-text">
                  单词列表
                </h2>
                <select 
                  value={displayCount}
                  onChange={(e) => setDisplayCount(Number(e.target.value))}
                  className="border rounded-lg px-3 py-1.5 text-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  {[4, 6, 8, 10].map(num => (
                    <option key={num} value={num}>{num} 个</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-4">
                {sampleWords.slice(0, displayCount).map((word) => (
                  <div 
                    key={word.id}
                    onClick={() => setSelectedWord(word)}
                    className={`word-card ${
                      selectedWord?.id === word.id 
                        ? 'ring-2 ring-pink-500 bg-pink-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="text-lg font-medium text-gray-800">{word.word}</h3>
                    <p className="text-gray-500 text-sm mt-1">{word.phonetic}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Word Details */}
          <div className="w-full md:w-2/3">
            <div className="detail-card">
              {selectedWord ? (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                      {selectedWord.word}
                    </h1>
                    <p className="text-gray-600 text-lg">{selectedWord.phonetic}</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="instagram-card p-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">释义</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedWord.explanation}</p>
                    </div>
                    
                    <div className="instagram-card p-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">例句</h3>
                      <p className="text-gray-700 italic leading-relaxed">{selectedWord.example}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <button className="instagram-gradient text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity transform hover:scale-105 duration-200">
                      开始练习
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                  <span className="text-6xl">👈</span>
                  <p className="text-xl font-medium">请从左侧选择一个单词</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 