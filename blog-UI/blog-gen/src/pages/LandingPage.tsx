import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Waves, Brain, MessageSquare, FileCheck } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const problemRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaRef = useRef(null);
  const isProblemInView = useInView(problemRef, { once: true, margin: "-100px" });
  const isHowItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const isCtaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  const handleTryNow = () => {
    navigate('/create');
  };

  const handleExploreClick = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#001A2A]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#003B5C] via-[#004974] to-[#0095D9]">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#40CFFF] rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#0095D9] rounded-full blur-[140px]"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl text-[#E6F4F9] mb-8 leading-tight" style={{ fontFamily: "'Patrick Hand SC', cursive" }}>
              What if your blog could think like Google before it's written?
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="mb-12"
          >
            <p className="text-xl md:text-2xl text-[#E6F4F9] leading-relaxed mb-4">
              Most AI writers just guess what Google wants.
            </p>
            <p className="text-xl md:text-2xl text-[#40CFFF] leading-relaxed mb-4">
              ContentRank doesn't guess it thinks strategically, aligning with Google's own ranking intelligence.
            </p>
            <p className="text-lg md:text-xl text-[#E6F4F9] opacity-90 leading-relaxed">
              Built on deep semantic modeling, EEAT optimization, and our proprietary Brain Rank Engine™,
              it writes content that both humans and algorithms trust.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExploreClick}
              className="px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 bg-gradient-to-r from-[#0078C2] to-[#00B4FF] text-white hover:shadow-[0_0_30px_rgba(64,207,255,0.5)] flex items-center gap-2"
            >
              <Waves size={20} />
              Explore How It Works
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTryNow}
              className="px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 bg-gradient-to-r from-[#0078C2] to-[#00B4FF] text-white hover:shadow-[0_0_30px_rgba(64,207,255,0.5)] flex items-center gap-2"
            >
              <Waves size={20} />
              Try Now
            </motion.button>
          </motion.div>
        </div>

        {/* Floating Neural Dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#40CFFF] rounded-full"
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </section>

      {/* The Problem Section */}
      <section ref={problemRef} className="py-32 px-6 bg-[#001A2A]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isProblemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            <p className="text-2xl md:text-3xl text-[#E6F4F9] leading-relaxed mb-6">
              You've tried the usual AI blog generators.
            </p>
            <p className="text-2xl md:text-3xl text-[#E6F4F9] leading-relaxed mb-6">
              They sound good until you realize they all sound the same.
            </p>

            <div className="my-16 h-px bg-gradient-to-r from-transparent via-[#40CFFF] to-transparent" />

            <p className="text-xl md:text-2xl text-[#40CFFF] leading-relaxed mb-6">
              The truth? Google isn't fooled by tone or fluff.
            </p>
            <p className="text-xl md:text-2xl text-[#E6F4F9] leading-relaxed mb-6">
              It looks for <span className="text-[#40CFFF] font-semibold">signals</span> context, authority, originality, depth, and consistency.
            </p>
            <p className="text-xl md:text-2xl text-[#E6F4F9] leading-relaxed mb-12">
              And generic AI misses all of them.
            </p>

            <p className="text-2xl md:text-3xl text-[#40CFFF] font-semibold leading-relaxed">
              That's why we built ContentRank because writing content for Google's brain requires understanding it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="py-32 px-6 bg-gradient-to-b from-[#003B5C] to-[#001A2A]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHowItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="text-center mb-20">
              <p className="text-[#40CFFF] text-sm font-medium tracking-wider uppercase mb-4">Simple, Calm, and Intelligent</p>
              <h2 className="font-heading text-5xl md:text-6xl text-[#E6F4F9]" style={{ fontFamily: "'Patrick Hand SC', cursive" }}>
                How It Works
              </h2>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-20 bottom-20 w-0.5 bg-gradient-to-b from-[#40CFFF] via-[#0095D9] to-[#40CFFF] transform -translate-x-1/2" />

              <div className="space-y-24">
                {[
                  {
                    icon: MessageSquare,
                    title: "Tell Us Your Goal",
                    description: "Enter your topic, desired length, audience type, and style nothing more."
                  },
                  {
                    icon: Brain,
                    title: "The Brain Thinks",
                    description: "Behind the scenes, ContentRank's agentic AI models break down your topic into structured semantic components and EEAT layers."
                  },
                  {
                    icon: FileCheck,
                    title: "You Get an Expert-Level Blog Draft",
                    description: "A complete, readable, factual blog designed to perform with predicted rank confidence and content health score."
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isHowItWorksInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.2, ease: 'easeOut' }}
                    className={`flex flex-col md:flex-row items-center gap-8 ${
                      index % 2 === 1 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-heading text-3xl md:text-4xl text-[#E6F4F9] mb-4" style={{ fontFamily: "'Patrick Hand SC', cursive" }}>
                        Step {index + 1} – {step.title}
                      </h3>
                      <p className="text-lg text-[#E6F4F9] leading-relaxed opacity-90">
                        {step.description}
                      </p>
                    </div>

                    <div className="relative flex-shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                        className="w-24 h-24 bg-gradient-to-br from-[#0078C2] to-[#00B4FF] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(64,207,255,0.4)] relative z-10"
                      >
                        <step.icon className="text-white" size={40} />
                      </motion.div>
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-32 px-6 bg-[#003B5C] relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-[#40CFFF] rounded-full blur-[150px]"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h2 className="font-heading text-5xl md:text-6xl text-[#E6F4F9] mb-8" style={{ fontFamily: "'Patrick Hand SC', cursive" }}>
              Stop guessing what ranks.
            </h2>
            <p className="text-3xl md:text-4xl text-[#40CFFF] font-semibold mb-12">
              Start writing with something that knows.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTryNow}
              className="px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 bg-gradient-to-r from-[#0078C2] to-[#00B4FF] text-white hover:shadow-[0_0_30px_rgba(64,207,255,0.5)] flex items-center gap-2 mx-auto"
            >
              <Waves size={20} />
              Try ContentRank for Free
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-[#001A2A]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="text-[#40CFFF]" size={32} />
            <h3 className="font-heading text-3xl text-[#E6F4F9]" style={{ fontFamily: "'Patrick Hand SC', cursive" }}>
              ContentRank
            </h3>
          </div>

          <p className="text-lg text-[#E6F4F9] opacity-80 mb-2">
            Built by people who were tired of rewriting AI content that didn't rank.
          </p>
          <p className="text-xl text-[#40CFFF] font-semibold">
            ContentRank™ - Intelligence with Intent.
          </p>

          <div className="mt-12 pt-8 border-t border-[#40CFFF]/20">
            <p className="text-sm text-[#E6F4F9] opacity-60">
              © 2025 ContentRank. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
