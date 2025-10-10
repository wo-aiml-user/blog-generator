import { useNavigate } from 'react-router-dom';
import { Zap, Network, MessageSquare, Clock, Sparkles, TrendingUp, Award, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header with Glassmorphism */}
      <header className="relative z-10 glass border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fadeInUp">
            <div className="w-12 h-12 gradient-blue rounded-xl flex items-center justify-center shadow-lg hover-glow">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Blog Writer</h1>
              <p className="text-xs text-slate-600 font-medium">Intelligent Content Creation</p>
            </div>
          </div>
          <div className="flex gap-3 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <button className="px-5 py-2.5 text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-all duration-300">
              Home
            </button>
            <button
              onClick={() => navigate('/create')}
              className="px-6 py-2.5 gradient-blue text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover-glow"
            >
              <Sparkles className="w-4 h-4" />
              Create Blog
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center justify-center w-24 h-24 gradient-primary rounded-3xl mb-8 relative shadow-2xl hover-lift">
            <Zap className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg">
              <Sparkles className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          <h2 className="text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Create Stunning Blogs with
            <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              AI-Powered Magic
            </span>
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Transform your ideas into engaging, well-structured blog posts with cutting-edge AI.
            <span className="block mt-2">Simply provide your topic and watch the magic happen ✨</span>
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center gap-3 px-10 py-5 gradient-blue text-white text-lg font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover-glow group"
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Start Creating Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-slate-700">100% Free</span>
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-slate-700">No Signup Required</span>
            </div>
          </div>
        </div>

        {/* Features Grid with Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
          <div className="glass p-8 rounded-3xl hover-lift animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="w-16 h-16 gradient-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Network className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">AI-Powered Intelligence</h3>
            <p className="text-slate-600 leading-relaxed">
              Advanced neural networks generate high-quality, original content perfectly tailored to your unique needs and style
            </p>
          </div>

          <div className="glass p-8 rounded-3xl hover-lift animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="w-16 h-16 gradient-purple rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Interactive Collaboration</h3>
            <p className="text-slate-600 leading-relaxed">
              Refine and perfect your content through an intuitive chat interface that understands your vision
            </p>
          </div>

          <div className="glass p-8 rounded-3xl hover-lift animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Lightning Fast</h3>
            <p className="text-slate-600 leading-relaxed">
              Generate professional, publication-ready blog posts in minutes instead of hours. Work smarter, not harder
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="glass rounded-3xl p-12 mb-20 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 gradient-blue rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">15,000+</div>
              <div className="text-slate-600 font-medium">Blog Posts Created</div>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 gradient-purple rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">4.9/5</div>
              <div className="text-slate-600 font-medium">Average Rating</div>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">100%</div>
              <div className="text-slate-600 font-medium">AI-Powered</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
          <h3 className="text-3xl font-bold text-slate-900 mb-4">Ready to Create Amazing Content?</h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who are already using AI to produce exceptional blog posts
          </p>
          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center gap-3 px-10 py-5 gradient-primary text-white text-lg font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover-glow"
          >
            <Sparkles className="w-6 h-6" />
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
