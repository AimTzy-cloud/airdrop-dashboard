"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Check,
  MessageSquare,
  TrendingUp,
  Search,
  Award,
  ShoppingBag,
  Plus,
  Send,
  Newspaper,
  Zap,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      {/* Animated background with grid pattern */}
      <div className="absolute inset-0 z-10 h-full w-full bg-gray-950">
        {/* Grid background with glowing blue lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1729_1px,transparent_1px),linear-gradient(to_bottom,#0f1729_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,0,0,0.5),transparent)]">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f680_0.5px,transparent_2px)] [background-size:24px_24px]"></div>
        </div>
        {/* Glow effect */}
        <div className="absolute top-0 -z-10 h-screen w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.3),rgba(0,0,0,0))]"></div>
      </div>

      {/* Header */}
      <header
        className={`px-4 lg:px-6 h-16 flex items-center border-b border-gray-800 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-gray-950/80 shadow-sm" : "bg-transparent"
        }`}
      >
        <Link className="flex items-center justify-center" href="/">
          <Image src='/logo-utama.png' alt='logo' width={120} height={120} className='relative right-8 max-sm:right-6 top-5' />
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How it Works
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/register">
            <Button size="sm" variant="default">
              Get Started
            </Button>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-b border-gray-800 z-40"
          >
            <nav className="flex flex-col p-4 gap-4">
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium hover:text-primary transition-colors p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium hover:text-primary transition-colors p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 z-20">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="flex flex-col justify-center space-y-4"
              >
                <div className="space-y-2">
                  <Badge className="mb-2 text-orange-400" variant="outline">
                    <Zap className="mr-1 h-3 w-3" /> New Platform Launch
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      Your Complete Crypto Ecosystem
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-white md:text-xl">
                    Track airdrops, chat with friends, send crypto, discover news, and trade NFTs—all in one powerful
                    platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="group bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className='text-black hover:text-white/80 hover:bg-transparent'>
                      Explore Features
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mx-auto lg:mx-0 relative"
              >
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 opacity-75 blur-lg"></div>
                <div className="relative rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-xl">
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src="/dashboard.jpeg"
                      width={700}
                      height={500}
                      alt="OrbitX Dashboard Preview"
                      className="rounded-lg shadow-md"
                    />
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="absolute -top-4 -right-4 bg-gray-800 p-3 rounded-lg shadow-lg flex items-center gap-2"
                  >
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-sm">Trending Airdrops</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="absolute -bottom-4 -left-4 bg-gray-800 p-3 rounded-lg shadow-lg flex items-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-sm">Crypto Chat</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section className="w-full py-8 border-y border-gray-800 bg-gray-900/50">
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <p className="text-md text-gray-400 font-mono">TRUSTED BY LEADING CRYPTO PROJECTS</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
                {["Ethereum", "Solana", "Polygon", "Arbitrum", "Optimism", "Monad", "MegaETH"].map((brand) => (
                  <motion.div
                    key={brand}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center"
                  >
                    <span className="text-lg font-semibold text-gray-400">{brand}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <motion.div variants={fadeInUp} className="space-y-2">
                <Badge variant="outline" className="mb-2 text-orange-400">
                  Powerful Features
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  All-in-One Crypto Platform
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Everything you need to manage your crypto journey in one place
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 mt-8">
                {[
                  {
                    title: "Airdrop Tracker",
                    description: "Add and track all your airdrop opportunities in one dashboard",
                    icon: Plus,
                    color: "bg-purple-500/10 text-purple-500",
                  },
                  {
                    title: "Crypto Chat",
                    description: "Chat with friends and send cryptocurrency directly through messages",
                    icon: MessageSquare,
                    color: "bg-blue-500/10 text-blue-500",
                  },
                  {
                    title: "Crypto News",
                    description: "Stay updated with the latest news and developments in the crypto world",
                    icon: Newspaper,
                    color: "bg-green-500/10 text-green-500",
                  },
                  {
                    title: "Trending Projects",
                    description: "Discover trending projects and opportunities in the crypto space",
                    icon: TrendingUp,
                    color: "bg-orange-500/10 text-orange-500",
                  },
                  {
                    title: "Search & Add",
                    description: "Search for projects and add them directly to your dashboard",
                    icon: Search,
                    color: "bg-pink-500/10 text-pink-500",
                  },
                  {
                    title: "Galxe Quests",
                    description: "Complete quests and earn rewards through Galxe integration",
                    icon: Award,
                    color: "bg-indigo-500/10 text-indigo-500",
                  },
                  {
                    title: "NFT Marketplace",
                    description: "Buy, sell, and trade NFTs directly on our platform",
                    icon: ShoppingBag,
                    color: "bg-red-500/10 text-red-500",
                  },
                  {
                    title: "Send Crypto",
                    description: "Send cryptocurrency to friends and contacts with ease",
                    icon: Send,
                    color: "bg-cyan-500/10 text-cyan-500",
                  },
                  {
                    title: "One-Click Add",
                    description: "Add airdrops to your dashboard with a single click",
                    icon: Plus,
                    color: "bg-amber-500/10 text-amber-500",
                  },
                ].map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    className="flex flex-col items-center space-y-2 border border-blue-900/30 p-6 rounded-lg shadow-sm bg-gray-900/80 hover:shadow-md transition-shadow hover:shadow-blue-500/10"
                  >
                    <div className={`p-3 rounded-full ${feature.color} shadow-glow`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    <p className="text-white text-center">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900/50 border-y border-gray-800">
          <div className="px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <motion.div variants={fadeInUp} className="space-y-2">
                <Badge variant="outline" className="mb-2 text-orange-400">
                  Simple Process
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How OrbitX Works</h2>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Get started with OrbitX in just a few simple steps
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-16 mt-12 relative">
                {/* Connection line */}
                <div className="hidden md:block absolute top-1/4 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-purple-600 to-blue-500"></div>

                {[
                  {
                    step: "01",
                    title: "Create Account",
                    description: "Sign up for an OrbitX account in seconds and set up your profile",
                  },
                  {
                    step: "02",
                    title: "Customize Dashboard",
                    description: "Add your favorite projects, airdrops, and customize your experience",
                  },
                  {
                    step: "03",
                    title: "Start Exploring",
                    description: "Discover opportunities, chat with friends, and manage your crypto journey",
                  },
                ].map((step) => (
                  <motion.div key={step.step} variants={fadeInUp} className="flex flex-col items-center relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-lg mb-4 z-10">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-100 text-center max-w-xs">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <motion.div variants={fadeInUp} className="space-y-2">
                <Badge variant="outline" className="mb-2 text-orange-400">
                  Interactive Demo
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Experience OrbitX</h2>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  See our platform in action with our interactive demo
                </p>
              </motion.div>
            </motion.div>

            <Tabs defaultValue="dashboard" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="chat">Crypto Chat</TabsTrigger>
                <TabsTrigger value="marketplace">NFT Market</TabsTrigger>
                <TabsTrigger value="quests">Galxe Quests</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg border border-gray-800 overflow-hidden shadow-lg"
                >
                  <Image
                    src="/placeholder.svg?height=500&width=900"
                    width={900}
                    height={500}
                    alt="OrbitX Dashboard"
                    className="w-full"
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="chat" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg border border-gray-800 overflow-hidden shadow-lg"
                >
                  <Image
                    src="/placeholder.svg?height=500&width=900"
                    width={900}
                    height={500}
                    alt="OrbitX Crypto Chat"
                    className="w-full"
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="marketplace" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg border border-gray-800 overflow-hidden shadow-lg"
                >
                  <Image
                    src="/placeholder.svg?height=500&width=900"
                    width={900}
                    height={500}
                    alt="OrbitX NFT Marketplace"
                    className="w-full"
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="quests" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg border border-gray-800 overflow-hidden shadow-lg"
                >
                  <Image
                    src="/placeholder.svg?height=500&width=900"
                    width={900}
                    height={500}
                    alt="OrbitX Galxe Quests"
                    className="w-full"
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900/50 border-y border-gray-800">
          <div className="px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <motion.div variants={fadeInUp} className="space-y-2">
                <Badge variant="outline" className="mb-2 text-orange-400">
                  Testimonials
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Hear from the crypto community about their experience with OrbitX
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    quote:
                      "OrbitX has completely transformed how I manage my crypto portfolio and track airdrops. The all-in-one platform saves me hours every week.",
                    name: "Alex Thompson",
                    title: "Crypto Investor",
                  },
                  {
                    quote:
                      "The ability to chat and send crypto in the same interface is game-changing. OrbitX has become my go-to platform for all things crypto.",
                    name: "Sarah Chen",
                    title: "DeFi Developer",
                  },
                  {
                    quote:
                      "As someone who participates in many Galxe quests, having them integrated into OrbitX has streamlined my workflow tremendously.",
                    name: "Michael Rodriguez",
                    title: "NFT Collector",
                  },
                ].map((testimonial) => (
                  <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800"
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-4 text-yellow-500 flex">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="mr-1"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                      </div>
                      <p className="italic text-gray-300 flex-grow">&ldquo;{testimonial.quote}&rdquo;</p>
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-400">{testimonial.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <motion.div variants={fadeInUp} className="space-y-2">
                <Badge variant="outline" className="mb-2 text-orange-400">
                  Pricing
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Choose the plan that works best for your crypto journey
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 mt-8">
                {/* Free Plan */}
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col border border-gray-800 p-6 rounded-lg shadow-sm bg-gray-900 relative"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-4 py-1 bg-gray-800 text-gray-200 text-sm font-medium rounded-full">
                    Explorer
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-bold">Free</h3>
                    <p className="text-gray-400 mt-1">Forever free</p>
                  </div>
                  <ul className="mt-6 space-y-3 flex-1">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Track up to 10 airdrops</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Basic crypto chat</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>News feed access</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Community access</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/register">
                      <Button className="w-full text-black hover:bg-white/20 hover:text-white transition duration-200" variant="outline">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col border-2 border-primary p-6 rounded-lg shadow-lg bg-gray-900 relative"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-4 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-bold">$9.99</h3>
                    <p className="text-gray-400 mt-1">per month</p>
                  </div>
                  <ul className="mt-6 space-y-3 flex-1">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Unlimited airdrops</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Full crypto chat with payments</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Priority notifications</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>NFT marketplace access</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Galxe quests integration</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/contact">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                        Contact Sales
                      </Button>
                    </Link>
                  </div>
                </motion.div>

                {/* Enterprise Plan */}
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col border border-gray-800 p-6 rounded-lg shadow-sm bg-gray-900 relative"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-4 py-1 bg-gray-800 text-white text-sm font-medium rounded-full">
                    Enterprise
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-bold">$49.99</h3>
                    <p className="text-gray-400 mt-1">per month</p>
                  </div>
                  <ul className="mt-6 space-y-3 flex-1">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Team collaboration</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>API access</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Custom integrations</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>White-label options</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/contact">
                      <Button className="w-full text-black hover:bg-white/20 hover:text-white transition duration-100" variant="outline">
                        Contact Sales
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-900 to-blue-900">
          <div className="px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center space-y-4 text-center text-white"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Join OrbitX?</h2>
              <p className="mx-auto max-w-[700px] md:text-xl">
                Start your crypto journey with OrbitX today and experience the future of crypto management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="text-black border-white hover:bg-white/10 hover:text-white">
                    Learn More
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="w-full py-12 md:py-16">
          <div className="px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Stay Updated</h2>
                <p className="mx-auto max-w-[500px] text-gray-400 md:text-lg">
                  Subscribe to our newsletter for the latest crypto news and OrbitX updates
                </p>
              </div>
              <div className="w-full max-w-md flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-gray-800 border-gray-700 text-white"
                />
                <Button type="submit">Subscribe</Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
        <div className="mx-auto px-10 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link className="flex items-center" href="/">
                <Image src='/footer.png' alt='Footer' width={120} height={120} />
              </Link>
              <p className="text-sm">
                Your complete crypto ecosystem for tracking airdrops, chatting, trading NFTs, and more.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="hover:text-white">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="hover:text-white">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link href="#" className="hover:text-white">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Licenses
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm hover:text-white">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2025 AimTzy. All rights reserved.</p>
            <p className="text-sm mt-4 md:mt-0">Designed and built with ❤️ for the crypto community</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
