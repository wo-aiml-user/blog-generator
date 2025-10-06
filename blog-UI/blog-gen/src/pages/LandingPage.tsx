import { useNavigate } from 'react-router-dom';
import { Zap, Network, MessageSquare, Clock } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI Blog Writer</h1>
              <p className="text-xs text-slate-500">Intelligent Content Creation</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Home
            </button>
            <button
              onClick={() => navigate('/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Create Blog
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-8 relative">
            <Zap className="w-10 h-10 text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
          </div>

          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Use AI Blog Writer to create your <span className="text-blue-600">blog post</span>
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Transform your ideas into engaging, well-structured blog posts with the power of artificial intelligence.
            Simply provide your topic and preferences, and let AI craft compelling content for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Network className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">AI-Powered</h3>
              <p className="text-slate-600 leading-relaxed">
                Advanced AI algorithms generate high-quality, original content tailored to your needs
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Interactive Chat</h3>
              <p className="text-slate-600 leading-relaxed">
                Collaborate with AI through an intuitive chat interface to refine your content
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Time-Saving</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate professional blog posts in minutes, not hours
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Getting Started
            <span className="text-xl">→</span>
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Free to use
            </div>
            <span>•</span>
            <span>No signup required</span>
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-slate-200">
          <div className="flex items-center justify-center gap-12 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>10,000+ blog posts created</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">★</span>
              <span>4.9/5 user rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>AI-powered content</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
