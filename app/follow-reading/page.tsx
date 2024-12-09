'use client'

import { useState, useEffect, useRef } from 'react'
import { wordApi } from '@/api/word'
import { UnitWord,WordMeaning} from '@/types/word'
import { useTheme } from '@/context/ThemeContext'
import WordListFilters from './components/WordListFilters'
import { SoundOutlined } from '@ant-design/icons'

export default function FollowReadingPage() {
  const { theme } = useTheme()
  const [words, setWords] = useState<UnitWord[]>([])
  const [selectedWord, setSelectedWord] = useState<UnitWord | null>(null)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [pronunciationType, setPronunciationType] = useState<'us' | 'uk'>('us')
  const [playCount, setPlayCount] = useState(0)
  const [repeatCount, setRepeatCount] = useState(2)
  const [interval, setInterval] = useState(2)
  const [showSettings, setShowSettings] = useState(false)
  const [isSequentialMode, setIsSequentialMode] = useState(false)
  const [wordTransitionInterval, setWordTransitionInterval] = useState(3)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const playPronunciation = async (audioUrl: string, count: number = 1, firstPlay: boolean = true) => {
    if (!audioUrl) return

    try {
      if (audioRef.current) {
        setIsPlaying(true)
        setPlayCount(count)
        audioRef.current.src = audioUrl
        
        if (!firstPlay) {
          // 如果不是第一次播放，添加延迟
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, interval * 1000)
          })
        }
        
        await audioRef.current.play()
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsPlaying(false)
      setPlayCount(0)
    }
  }

  const handleAudioEnded = () => {
    if (playCount > 1 && selectedWord) {
      // 还需要继续播放
      const audioUrl = pronunciationType === 'us' ? selectedWord.pronunciation_us : selectedWord.pronunciation_uk
      playPronunciation(audioUrl, playCount - 1, false)
    } else {
      setIsPlaying(false)
      setPlayCount(0)
      
      // 如果在连续练习模式下，自动进入下一个单词
      if (isSequentialMode && selectedWord) {
        const currentIndex = words.findIndex(w => w.id === selectedWord.id)
        if (currentIndex < words.length - 1) {
          const nextWord = words[currentIndex + 1]
          setSelectedWord(nextWord)
          // 使用设置的单词切换间隔时间
          setTimeout(() => {
            const audioUrl = pronunciationType === 'us' ? nextWord.pronunciation_us : nextWord.pronunciation_uk
            playPronunciation(audioUrl, repeatCount, true)
          }, wordTransitionInterval * 1000)
        } else {
          // 已经是最后一个单词了
          setIsSequentialMode(false)
        }
      }
    }
  }

  const handleStopSequentialMode = () => {
    setIsSequentialMode(false)
    // 如果当前正在播放，也停止播放
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
        setPlayCount(0)
      }
    }
  }

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const fetchUnitWords = async (unitId: number) => {
    setLoading(true)
    try {
      const response = await wordApi.getWords(unitId)
      console.log('✅ Unit words response:', response)
      if (response?.data) {
        setWords(response.data)
        setSelectedWord(null)
      }
    } catch (error) {
      console.error('❌ Error fetching unit words:', error)
      setWords([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <audio 
        ref={audioRef} 
        className="hidden" 
        onEnded={handleAudioEnded}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <WordListFilters onUnitChange={fetchUnitWords} />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Word List */}
          <div className="w-full md:w-1/3">
            <div className="instagram-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold gradient-text">
                  单词列表
                </h2>
                <div className="text-sm text-gray-500">
                  共 {words.length} 个单词
                </div>
              </div>
              
              <div 
                className="space-y-4 max-h-[600px] overflow-y-auto scroll-smooth"
              >
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  </div>
                ) : words.length > 0 ? (
                  words.map((word) => (
                    <div 
                      key={word.id}
                      onClick={() => setSelectedWord(word)}
                      className={`word-card p-4 flex flex-col items-center ${
                        selectedWord?.id === word.id 
                          ? 'ring-2 ring-pink-500 bg-pink-50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="text-2xl font-medium text-gray-800 text-center mb-3">
                        {word.word}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{word.phonetic_us}</span>
                        <span>{word.phonetic_uk}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    请选择一个单元以查看单词列表
                  </div>
                )}
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
                    <div className="flex items-center gap-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">美 {selectedWord.phonetic_us}</span>
                        <button
                          onClick={() => playPronunciation(selectedWord.pronunciation_us)}
                          disabled={isPlaying}
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <SoundOutlined className="text-lg" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">英 {selectedWord.phonetic_uk}</span>
                        <button
                          onClick={() => playPronunciation(selectedWord.pronunciation_uk)}
                          disabled={isPlaying}
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <SoundOutlined className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="instagram-card p-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">释义</h3>
                      {(() => {
                        try {
                          const meanings: WordMeaning[] = JSON.parse(selectedWord.meaning);
                          return (
                            <div className="space-y-2">
                              {meanings.map((meaning, index) => (
                                <div key={index} className="text-gray-700 leading-relaxed">
                                  <span className="font-medium text-gray-900">{meaning.pos}</span>{' '}
                                  {meaning.definition}
                                </div>
                              ))}
                            </div>
                          );
                        } catch (e) {
                          console.error('Error parsing meaning:', e);
                          return <p className="text-gray-700 leading-relaxed">{selectedWord.meaning}</p>;
                        }
                      })()}
                    </div>
                    
                    <div className="instagram-card p-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">例句</h3>
                      <div className="space-y-6">
                        {selectedWord.example.split('\n').filter(Boolean).map((example, index) => {
                          const [en, zh] = example.split('|');
                          return (
                            <div key={index} className="group">
                              <div className="text-gray-800 mb-1.5 group-hover:text-blue-600 transition-colors">
                                {en}
                              </div>
                              <div className="text-gray-500 pl-4 border-l-2 border-pink-200 group-hover:border-pink-400 transition-colors">
                                {zh}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => {
                          const audioUrl = pronunciationType === 'us' 
                            ? selectedWord.pronunciation_us 
                            : selectedWord.pronunciation_uk
                          playPronunciation(audioUrl, repeatCount, true)
                        }}
                        disabled={isPlaying}
                        className="instagram-gradient text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity transform hover:scale-105 duration-200 disabled:opacity-50"
                      >
                        {isPlaying ? '播放中...' : '开始练习'}
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (isSequentialMode) {
                            handleStopSequentialMode()
                          } else {
                            setIsSequentialMode(true)
                            const audioUrl = pronunciationType === 'us' 
                              ? selectedWord.pronunciation_us 
                              : selectedWord.pronunciation_uk
                            playPronunciation(audioUrl, repeatCount, true)
                          }
                        }}
                        disabled={isPlaying && !isSequentialMode}
                        className={`relative overflow-hidden px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                          isSequentialMode 
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
                        }`}
                      >
                        <div className={`flex items-center gap-2 transition-transform duration-300 ${
                          isSequentialMode ? 'scale-90' : 'scale-100'
                        }`}>
                          {isSequentialMode ? (
                            <>
                              <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              <span>停止跟读</span>
                            </>
                          ) : (
                            <span>开始跟读</span>
                          )}
                        </div>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                    >
                      <span>{showSettings ? '收起设置' : '展开设置'}</span>
                      <svg
                        className={`w-4 h-4 transform transition-transform ${
                          showSettings ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    
                    <div className={`space-y-4 overflow-hidden transition-all duration-300 ${
                      showSettings ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => setPronunciationType('us')}
                          className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                            pronunciationType === 'us'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          美式发音
                        </button>
                        <button
                          onClick={() => setPronunciationType('uk')}
                          className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                            pronunciationType === 'uk'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          英式发音
                        </button>
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-sm text-gray-500">
                          发音次数: {repeatCount} 次
                        </div>
                        <div className="w-64 flex items-center gap-3">
                          <span className="text-xs text-gray-400">1</span>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={repeatCount}
                            onChange={(e) => setRepeatCount(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                          />
                          <span className="text-xs text-gray-400">5</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-sm text-gray-500">
                          发音间隔: {interval} 秒
                        </div>
                        <div className="w-64 flex items-center gap-3">
                          <span className="text-xs text-gray-400">1s</span>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={interval}
                            onChange={(e) => setInterval(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                          />
                          <span className="text-xs text-gray-400">20s</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-sm text-gray-500">
                          单词切换间隔: {wordTransitionInterval} 秒
                        </div>
                        <div className="w-64 flex items-center gap-3">
                          <span className="text-xs text-gray-400">1s</span>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={wordTransitionInterval}
                            onChange={(e) => setWordTransitionInterval(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                          />
                          <span className="text-xs text-gray-400">10s</span>
                        </div>
                      </div>
                    </div>
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