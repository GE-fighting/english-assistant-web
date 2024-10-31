'use client'

import { useTheme } from '@/context/ThemeContext'

export default function ProgressPage() {
  const { theme } = useTheme()
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Coming Soon Content */}
        <div className="instagram-card p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">⚙️</div>
            <h1 className="text-3xl font-bold mb-4 gradient-text">
              学习进度功能开发中
            </h1>
            <p className="text-gray-600 mb-8">
              我们正在打造个性化的学习进度追踪系统，即将为您呈现！
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="instagram-card p-6 aspect-square flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-100 rounded-full max-w-md mx-auto">
              <div className="h-2 rounded-full instagram-gradient w-1/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 