'use client'

import Link from 'next/link'
import Image from 'next/image'

// Import Swiper and modules
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const features = [
  {
    id: 1,
    title: "智能跟读练习",
    description: "通过AI技术，实时评估发音准确度",
    icon: "🎯",
    link: "/follow-reading"
  },
  {
    id: 2,
    title: "丰富的词汇库",
    description: "包含常用词汇和专业术语",
    icon: "📚",
    link: "/vocabulary"
  },
  {
    id: 3,
    title: "个性化学习计划",
    description: "根据学习进度智能调整内容",
    icon: "🎨",
    link: "/learning-path"
  },
  {
    id: 4,
    title: "实时进度追踪",
    description: "直观展示学习成果",
    icon: "📊",
    link: "/progress"
  }
]

const slides = [
  {
    id: 1,
    image: "/slides/slide1.webp",
    title: "提升口语能力",
    subtitle: "AI驱动的智能学习平台"
  },
  {
    id: 2,
    image: "/slides/slide2.webp",
    title: "随时随地学习",
    subtitle: "便捷的移动端支持"
  },
  {
    id: 3,
    image: "/slides/slide3.webp",
    title: "科学的学习方法",
    subtitle: "循序渐进，稳步提高"
  }
]

export default function HomePage() {

  return (
    <main className="min-h-screen">
      {/* Hero Section with Slider */}
      <section className="relative h-[600px] mb-12">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active instagram-gradient'
          }}
          navigation
          className="h-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-40">
                  <div className="container mx-auto px-4 h-full flex items-center">
                    <div className="text-white max-w-2xl">
                      <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
                      <p className="text-xl">{slide.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Features Grid - 同样调整容器宽度 */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
          平台特色
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link 
              href={feature.link} 
              key={feature.id}
              className="instagram-card group p-6 text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 gradient-text">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section - 同样调整容器宽度 */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="instagram-card p-12 text-center">
          <h2 className="text-3xl font-bold mb-6 gradient-text">
            开始你的学习之旅
          </h2>
          <p className="mb-8 max-w-2xl mx-auto">
            通过我们的智能学习平台，让英语学习变得更加有趣和高效。
          </p>
          <Link 
            href="/follow-reading"
            className="instagram-gradient text-white px-8 py-3 rounded-full font-medium inline-block hover:opacity-90 transition-opacity transform hover:scale-105 duration-200"
          >
            立即开始
          </Link>
        </div>
      </section>
    </main>
  )
} 