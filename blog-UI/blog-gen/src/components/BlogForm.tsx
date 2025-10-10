import { useState } from 'react';
import { Zap, Sparkles } from 'lucide-react';

interface BlogFormProps {
  onGenerate: (topic: string, tone: string, length: number, targetAudience: string, numOutlines: number) => void;
  loading: boolean;
}

export default function BlogForm({ onGenerate, loading }: BlogFormProps) {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [customTone, setCustomTone] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [customAudience, setCustomAudience] = useState('');
  const [length, setLength] = useState(500);
  const [numOutlines, setNumOutlines] = useState(6);

  const handleToneChange = (value: string) => {
    setTone(value);
    if (value !== 'custom') {
      setCustomTone('');
    }
  };

  const handleAudienceChange = (value: string) => {
    setTargetAudience(value);
    if (value !== 'custom') {
      setCustomAudience('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTone = tone === 'custom' ? customTone : tone;
    const finalAudience = targetAudience === 'custom' ? customAudience : targetAudience;
    if (topic.trim() && finalTone.trim() && finalAudience.trim() && numOutlines >= 3 && numOutlines <= 8) {
      onGenerate(topic, finalTone, length, finalAudience, numOutlines);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 gradient-blue rounded-full text-white text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          Step 1: Configure Your Blog
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Create Your Blog Post</h3>
        <p className="text-slate-600">
          Fill in the details below to generate your AI-powered blog content
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="group">
          <label htmlFor="topic" className="block text-sm font-semibold text-slate-700 mb-3">
            Blog Post Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The Future of Artificial Intelligence in Healthcare"
            className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 group-hover:border-slate-300 bg-white shadow-sm"
            required
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            What would you like to write about?
          </p>
        </div>

        <div className="group">
          <label htmlFor="tone" className="block text-sm font-semibold text-slate-700 mb-3">
            Writing Tone <span className="text-red-500">*</span>
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => handleToneChange(e.target.value)}
            className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 group-hover:border-slate-300 bg-white shadow-sm appearance-none cursor-pointer"
            required
            disabled={loading}
          >
            <option value="">Select the tone for your blog post</option>
            <option value="Professional">💼 Professional</option>
            <option value="Casual">😊 Casual</option>
            <option value="Friendly">🤝 Friendly</option>
            <option value="Academic">🎓 Academic</option>
            <option value="Conversational">💬 Conversational</option>
            <option value="Technical">⚙️ Technical</option>
            <option value="custom">✨ Custom (Specify your own)</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">Choose the style that best fits your audience</p>

          {tone === 'custom' && (
            <div className="mt-4 animate-fadeInUp">
              <input
                type="text"
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                placeholder="e.g., Humorous, Inspirational, Educational..."
                className="w-full px-5 py-4 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-indigo-50/50"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-2">Describe your preferred writing style</p>
            </div>
          )}
        </div>

        <div className="group">
          <label htmlFor="targetAudience" className="block text-sm font-semibold text-slate-700 mb-3">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <select
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => handleAudienceChange(e.target.value)}
            className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 group-hover:border-slate-300 bg-white shadow-sm appearance-none cursor-pointer"
            required
            disabled={loading}
          >
            <option value="">Select your target audience</option>
            <option value="General Public">👥 General Public</option>
            <option value="Business Professionals">💼 Business Professionals</option>
            <option value="Technical Experts">🔧 Technical Experts</option>
            <option value="Students">📚 Students</option>
            <option value="Entrepreneurs">🚀 Entrepreneurs</option>
            <option value="Researchers">🔬 Researchers</option>
            <option value="custom">✨ Custom (Specify your own)</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">Who will be reading this content?</p>

          {targetAudience === 'custom' && (
            <div className="mt-4 animate-fadeInUp">
              <input
                type="text"
                value={customAudience}
                onChange={(e) => setCustomAudience(e.target.value)}
                placeholder="e.g., Marketing Managers, Healthcare Professionals..."
                className="w-full px-5 py-4 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-indigo-50/50"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-2">Describe your target audience</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label htmlFor="numOutlines" className="block text-sm font-semibold text-slate-700 mb-3">
              Outline Sections <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="numOutlines"
              value={numOutlines}
              onChange={(e) => setNumOutlines(Number(e.target.value))}
              min={3}
              max={8}
              step={1}
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 group-hover:border-slate-300 bg-white shadow-sm"
              required
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-2">Range: 3–8 sections</p>
          </div>

          <div className="group">
            <label htmlFor="length" className="block text-sm font-semibold text-slate-700 mb-3">
              Word Count <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="length"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              min="200"
              max="3000"
              step="100"
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 group-hover:border-slate-300 bg-white shadow-sm"
              required
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-2">Range: 200–3000 words</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full gradient-blue text-white py-5 px-6 rounded-xl font-bold text-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 hover-glow group"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating Your Content...
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Generate Blog Post
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </>
          )}
        </button>

        {!loading && (
          <p className="text-center text-xs text-slate-500 mt-4">
            ✨ Your content will be generated in seconds
          </p>
        )}
      </form>
    </div>
  );
}
