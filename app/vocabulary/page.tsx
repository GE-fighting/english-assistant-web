'use client'


export default function VocabularyPage() {
  // const { theme } = useTheme()
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Coming Soon Content */}
        <div className="instagram-card p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🚧</div>
            <h1 className="text-3xl font-bold mb-4 gradient-text">
              词汇库功能开发中
            </h1>
            <p className="text-gray-600 mb-8">
              我们正在努力开发更丰富的词汇学习功能，敬请期待！
            </p>
            <div className="space-y-4">
              <div className="h-3 bg-gray-100 rounded-full w-3/4 mx-auto animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded-full w-1/2 mx-auto animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded-full w-2/3 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 