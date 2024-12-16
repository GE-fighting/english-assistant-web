'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/context/ThemeContext'

type Theme = 'default' | 'nature' | 'minimal'

const navigation = [
  { name: '首页', href: '/' },
  { name: '跟读练习', href: '/follow-reading' },
  { name: '词汇库', href: '/vocabulary' },
  { name: '学习进度', href: '/progress' },
]

const themes: { id: Theme; icon: string; label: string }[] = [
  { id: 'default', icon: '🌸', label: '粉色主题' },
  { id: 'nature', icon: '🌊', label: '深蓝主题' },
  { id: 'minimal', icon: '⚪', label: '默认主题' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/platform_icon.webp"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className={`text-xl font-bold gradient-text`}>
              Wen&apos;s Whispering Words
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 relative group ${
                  pathname === item.href
                    ? 'primary-text'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name}
                <span 
                  className={`absolute -bottom-1 left-0 w-full h-0.5 transform origin-left transition-transform duration-200 ${
                    pathname === item.href
                      ? 'bg-green-500 scale-x-100'
                      : 'bg-pink-500 scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Theme Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                theme === 'nature'
                  ? 'hover:bg-green-50'
                  : theme === 'minimal'
                    ? 'hover:bg-gray-100'
                    : 'hover:bg-pink-50'
              }`}
            >
              <span className="text-xl">
                {themes.find(t => t.id === theme)?.icon}
              </span>
            </button>

            {/* Theme Menu */}
            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  {themes.map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => {
                        setTheme(themeOption.id)
                        setIsThemeMenuOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-sm text-left flex items-center space-x-2 ${
                        theme === themeOption.id
                          ? 'bg-gray-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span>{themeOption.icon}</span>
                      <span>{themeOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
