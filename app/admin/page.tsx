import Link from 'next/link'

export default function AdminPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          返回首页
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>
      
      <div className="grid gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">内容管理</h2>
          <div className="space-y-2">
            <button className="w-full p-2 bg-blue-500 text-white rounded">
              添加新文章
            </button>
            <button className="w-full p-2 bg-gray-500 text-white rounded">
              管理现有文章
            </button>
          </div>
        </div>
      </div>
    </main>
  )
} 