"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Cpu, MonitorPlay } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Next-Gen Performance</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            The specs you need. <br />
            <span className="text-gradient">No compromises.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12">
            GadgetHub is the specification-first electronics marketplace. Compare raw compute power, display tech, and battery life side-by-side. 
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/products" 
              className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2"
            >
              Explore Products
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/compare" 
              className="px-8 py-4 rounded-xl glass hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              Compare Specs
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Laptops Card */}
          <Link href="/products?category=laptops" className="group relative overflow-hidden rounded-3xl glass-panel p-8 aspect-video flex flex-col justify-end transition-transform hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            {/* Placeholder for dynamic 3D asset/image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
               <Cpu className="w-48 h-48 text-indigo-400" />
            </div>
            <div className="relative z-20">
              <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Laptops</h3>
              <p className="text-gray-300">Unleash peak productivity and gaming performance.</p>
            </div>
          </Link>
          
          {/* Smartphones Card */}
          <Link href="/products?category=smartphones" className="group relative overflow-hidden rounded-3xl glass-panel p-8 aspect-video flex flex-col justify-end transition-transform hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
               <MonitorPlay className="w-48 h-48 text-cyan-400" />
            </div>
            <div className="relative z-20">
              <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Smartphones</h3>
              <p className="text-gray-300">The world's most advanced mobile technology.</p>
            </div>
          </Link>
        </div>
      </section>
      
      {/* Why GadgetHub */}
      <section className="w-full py-24 bg-black/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Deep Specs</h3>
              <p className="text-gray-400">We don't hide the details. See the exact processor model, RAM speed, and display nits.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
                <ArrowRight className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Side-by-Side Compare</h3>
              <p className="text-gray-400">Our powerful comparison engine highlights the true differences between products.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Secure & Fast</h3>
              <p className="text-gray-400">Instant checkout, robust warranty, and guaranteed authentic products.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
