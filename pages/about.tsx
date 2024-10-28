import Head from 'next/head'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function About() {
  return (
    <>
      <Head>
        <title>About - English Assistant</title>
        <meta name="description" content="About English Assistant" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center">About Us</h1>
          <p className="mt-4 text-center">
            English Assistant helps you improve your English skills.
          </p>
        </main>
        <Footer />
      </div>
    </>
  )
}
