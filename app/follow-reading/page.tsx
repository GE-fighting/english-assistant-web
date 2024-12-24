'use client'

import { useState, useEffect, useRef } from 'react'
import { wordApi } from '@/api/word'
import { UnitWord,WordMeaning} from '@/types/word'
import WordListFilters from './components/WordListFilters'
import { SoundOutlined } from '@ant-design/icons'

export default function FollowReadingPage() {
  // const { theme } = useTheme()
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenTheme, setFullscreenTheme] = useState<'dark' | 'light'>('dark')
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

  // Add fullscreen exit handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [isFullscreen])

  return (
    <div className="min-h-screen">
      <audio 
        ref={audioRef} 
        className="hidden" 
        onEnded={handleAudioEnded}
      />
      <div className={`transition-all duration-500 ${
        isFullscreen 
          ? fullscreenTheme === 'dark'
            ? 'fixed inset-0 bg-black z-50 overflow-auto'
            : 'fixed inset-0 bg-gray-50 z-50 overflow-auto'
          : 'max-w-7xl mx-auto px-4 py-8'
      }`}>
        <div className={`mb-6 ${isFullscreen ? 'hidden' : ''}`}>
          <WordListFilters onUnitChange={fetchUnitWords} />
        </div>

        <div className={`flex flex-col md:flex-row gap-8 ${
          isFullscreen ? 'min-h-screen' : ''
        }`}>
          {/* Left: Word List */}
          <div className={`w-full md:w-1/3 ${isFullscreen ? 'hidden' : ''}`}>
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
          <div className={`w-full ${isFullscreen ? 'h-full' : 'md:w-2/3'}`}>
            <div className={`detail-card h-full ${
              isFullscreen 
                ? 'flex items-center justify-center min-h-screen bg-transparent relative' 
                : ''
            }`}>
              {/* Theme Toggle and Exit Buttons */}
              {isFullscreen && (
                <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
                  <button
                    onClick={() => setFullscreenTheme(fullscreenTheme === 'dark' ? 'light' : 'dark')}
                    className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                      fullscreenTheme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-white hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {fullscreenTheme === 'dark' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                        />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                      fullscreenTheme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-white hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg 
                      className="w-6 h-6" 
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
                  </button>
                </div>
              )}

              {selectedWord ? (
                <>
                  <div className={`space-y-8 ${
                    isFullscreen 
                      ? `w-[85%] lg:w-[75%] max-w-6xl mx-auto px-6 lg:px-12 py-8 lg:py-12 mt-8 mb-20 ${
                        fullscreenTheme === 'dark'
                          ? 'bg-gray-900 border-gray-800'
                          : 'bg-white border-gray-200'
                      } rounded-3xl border shadow-2xl relative` 
                      : ''
                  }`}>
                    {/* Navigation Buttons in Fullscreen */}
                    {isFullscreen && (
                      <div className="fixed left-4 lg:left-8 right-4 lg:right-8 top-[45%] -translate-y-1/2 flex justify-between pointer-events-none z-40">
                        <button
                          onClick={() => {
                            const currentIndex = words.findIndex(w => w.id === selectedWord.id)
                            if (currentIndex > 0) {
                              setSelectedWord(words[currentIndex - 1])
                            }
                          }}
                          disabled={words.findIndex(w => w.id === selectedWord.id) === 0}
                          className={`p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-110 pointer-events-auto disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                            fullscreenTheme === 'dark'
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white'
                          } ${
                            words.findIndex(w => w.id === selectedWord.id) === 0 ? 'opacity-30' : ''
                          }`}
                        >
                          <svg 
                            className="w-8 h-8" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            const currentIndex = words.findIndex(w => w.id === selectedWord.id)
                            if (currentIndex < words.length - 1) {
                              setSelectedWord(words[currentIndex + 1])
                            }
                          }}
                          disabled={words.findIndex(w => w.id === selectedWord.id) === words.length - 1}
                          className={`p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-110 pointer-events-auto disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                            fullscreenTheme === 'dark'
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white'
                          } ${
                            words.findIndex(w => w.id === selectedWord.id) === words.length - 1 ? 'opacity-30' : ''
                          }`}
                        >
                          <svg 
                            className="w-8 h-8" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    )}

                    <div className={`border-b pb-6 lg:pb-8 ${
                      isFullscreen 
                        ? `text-center border-${fullscreenTheme === 'dark' ? 'gray-800' : 'gray-200'}` 
                        : ''
                    }`}>
                      <h1 className={`font-bold mb-6 ${
                        isFullscreen 
                          ? 'text-6xl sm:text-7xl lg:text-8xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text animate-gradient' 
                          : 'text-3xl bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text'
                      }`}>
                        {selectedWord.word}
                      </h1>
                      <div className={`flex flex-col sm:flex-row items-center gap-6 sm:gap-12 ${
                        isFullscreen 
                          ? `text-xl lg:text-2xl justify-center ${
                            fullscreenTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }` 
                          : 'text-gray-600'
                      }`}>
                        <div className="flex items-center gap-4">
                          <span className={isFullscreen ? 'text-2xl' : 'text-lg'}>
                            美 {selectedWord.phonetic_us}
                          </span>
                          <button
                            onClick={() => playPronunciation(selectedWord.pronunciation_us)}
                            disabled={isPlaying}
                            className={`p-3 rounded-full transition-all duration-300 disabled:opacity-50 ${
                              isFullscreen 
                                ? fullscreenTheme === 'dark'
                                  ? 'bg-pink-600/20 hover:bg-pink-600/30 text-pink-400'
                                  : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-600'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <SoundOutlined className={isFullscreen ? 'text-2xl' : 'text-lg'} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={isFullscreen ? 'text-2xl' : 'text-lg'}>
                            英 {selectedWord.phonetic_uk}
                          </span>
                          <button
                            onClick={() => playPronunciation(selectedWord.pronunciation_uk)}
                            disabled={isPlaying}
                            className={`p-3 rounded-full transition-all duration-300 disabled:opacity-50 ${
                              isFullscreen 
                                ? fullscreenTheme === 'dark'
                                  ? 'bg-pink-600/20 hover:bg-pink-600/30 text-pink-400'
                                  : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-600'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <SoundOutlined className={isFullscreen ? 'text-2xl' : 'text-lg'} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6 lg:space-y-8">
                      <div className={`${
                        isFullscreen 
                          ? fullscreenTheme === 'dark'
                            ? 'bg-gray-800/50 border-gray-800'
                            : 'bg-gray-50 border-gray-200'
                          : 'instagram-card'
                      } p-6 lg:p-8 rounded-2xl border`}>
                        <h3 className={`font-semibold mb-4 lg:mb-6 ${
                          isFullscreen 
                            ? fullscreenTheme === 'dark'
                              ? 'text-xl lg:text-2xl text-pink-400'
                              : 'text-xl lg:text-2xl text-pink-600'
                            : 'text-lg text-gray-800'
                        }`}>
                          释义
                        </h3>
                        {(() => {
                          try {
                            const meanings: WordMeaning[] = JSON.parse(selectedWord.meaning);
                            return (
                              <div className="space-y-4">
                                {meanings.map((meaning, index) => (
                                  <div key={index} className={`leading-relaxed ${
                                    isFullscreen 
                                      ? fullscreenTheme === 'dark'
                                        ? 'text-xl text-gray-300'
                                        : 'text-xl text-gray-700'
                                      : 'text-gray-700'
                                  }`}>
                                    <span className={`font-medium ${
                                      isFullscreen 
                                        ? fullscreenTheme === 'dark'
                                          ? 'text-purple-400'
                                          : 'text-purple-600'
                                        : 'text-gray-900'
                                    }`}>{meaning.pos}</span>{' '}
                                    {meaning.definition}
                                  </div>
                                ))}
                              </div>
                            );
                          } catch (e) {
                            console.error('Error parsing meaning:', e);
                            return <p className={`leading-relaxed ${
                              isFullscreen 
                                ? fullscreenTheme === 'dark'
                                  ? 'text-xl text-gray-300'
                                  : 'text-xl text-gray-700'
                                : 'text-gray-700'
                            }`}>{selectedWord.meaning}</p>;
                          }
                        })()}
                      </div>
                      
                      <div className={`${
                        isFullscreen 
                          ? fullscreenTheme === 'dark'
                            ? 'bg-gray-800/50 border-gray-800'
                            : 'bg-gray-50 border-gray-200'
                          : 'instagram-card'
                      } p-6 lg:p-8 rounded-2xl border`}>
                        <h3 className={`font-semibold mb-4 lg:mb-6 ${
                          isFullscreen 
                            ? fullscreenTheme === 'dark'
                              ? 'text-xl lg:text-2xl text-pink-400'
                              : 'text-xl lg:text-2xl text-pink-600'
                            : 'text-lg text-gray-800'
                        }`}>
                          例句
                        </h3>
                        <div className="space-y-6 lg:space-y-8">
                          {selectedWord.example.split('\n').filter(Boolean).map((example, index) => {
                            const [en, zh] = example.split('|');
                            return (
                              <div key={index} className="group">
                                <div className={`mb-3 transition-colors ${
                                  isFullscreen 
                                    ? fullscreenTheme === 'dark'
                                      ? 'text-xl text-gray-200 group-hover:text-purple-400'
                                      : 'text-xl text-gray-800 group-hover:text-purple-600'
                                    : 'text-gray-800 group-hover:text-purple-600'
                                }`}>
                                  {en}
                                </div>
                                <div className={`pl-4 border-l-2 transition-colors ${
                                  isFullscreen 
                                    ? fullscreenTheme === 'dark'
                                      ? 'text-lg text-gray-400 border-pink-500/30 group-hover:border-pink-500'
                                      : 'text-lg text-gray-600 border-pink-400/30 group-hover:border-pink-400'
                                    : 'text-gray-500 border-pink-200 group-hover:border-pink-400'
                                }`}>
                                  {zh}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Only show settings in normal mode */}
                    {!isFullscreen && (
                      <div className="pt-4 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                          <button 
                            onClick={() => {
                              const audioUrl = pronunciationType === 'us' 
                                ? selectedWord.pronunciation_us 
                                : selectedWord.pronunciation_uk
                              playPronunciation(audioUrl, repeatCount, true)
                            }}
                            disabled={isPlaying}
                            className={`px-10 py-4 rounded-xl font-medium text-lg transition-all duration-300 disabled:opacity-50 ${
                              isFullscreen
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white transform hover:scale-105 shadow-lg'
                                : 'instagram-gradient text-white hover:opacity-90 transform hover:scale-105'
                            }`}
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
                            className={`relative overflow-hidden px-10 py-4 rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                              isSequentialMode 
                                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500' 
                                : isFullscreen
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500'
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
                        
                        {/* Only show settings in normal mode */}
                        {!isFullscreen && (
                          <>
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
                            
                            <div className={`space-y-6 overflow-hidden transition-all duration-300 ${
                              showSettings 
                                ? 'max-h-[500px] opacity-100' 
                                : 'max-h-0 opacity-0'
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

                              <div className="flex flex-col items-center space-y-2">
                                <div className="text-sm text-gray-500">
                                  跟读界面
                                </div>
                                <div className="flex justify-center gap-4">
                                  <button
                                    onClick={() => setIsFullscreen(false)}
                                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                                      !isFullscreen
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                  >
                                    正常模式
                                  </button>
                                  <button
                                    onClick={() => setIsFullscreen(true)}
                                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                                      isFullscreen
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                  >
                                    全屏模式
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fixed Action Buttons in Fullscreen Mode */}
                  {isFullscreen && (
                    <div className={`fixed bottom-0 left-0 right-0 ${
                      fullscreenTheme === 'dark'
                        ? 'bg-gradient-to-t from-black via-black/95 to-transparent'
                        : 'bg-gradient-to-t from-white via-white/95 to-transparent'
                    } py-6 z-50`}>
                      <div className="max-w-2xl mx-auto px-6 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                        <button 
                          onClick={() => {
                            const audioUrl = pronunciationType === 'us' 
                              ? selectedWord.pronunciation_us 
                              : selectedWord.pronunciation_uk
                            playPronunciation(audioUrl, repeatCount, true)
                          }}
                          disabled={isPlaying}
                          className={`px-10 py-4 rounded-xl font-medium text-lg transition-all duration-300 disabled:opacity-50 ${
                            isFullscreen
                              ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white transform hover:scale-105 shadow-lg'
                              : 'instagram-gradient text-white hover:opacity-90 transform hover:scale-105'
                          }`}
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
                          className={`relative overflow-hidden px-10 py-4 rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                            isSequentialMode 
                              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500' 
                              : isFullscreen
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500'
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
                    </div>
                  )}
                </>
              ) : (
                <div className={`flex flex-col items-center justify-center min-h-[50vh] space-y-4 ${
                  isFullscreen 
                    ? fullscreenTheme === 'dark'
                      ? 'text-gray-300'
                      : 'text-gray-600'
                    : 'text-gray-500'
                }`}>
                  <span className="text-6xl">👈</span>
                  <p className="text-xl font-medium">请从左侧选择一个单词</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 8s linear infinite;
        }
      `}</style>
    </div>
  )
}