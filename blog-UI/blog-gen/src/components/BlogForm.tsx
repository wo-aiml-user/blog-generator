import { useState } from 'react';
import { Zap } from 'lucide-react';

interface BlogFormProps {
  onGenerate: (topic: string, tone: string, length: number, targetAudience: string, numOutlines: number, sourceUrl: string) => void;
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
  const [sourceUrl, setSourceUrl] = useState('');

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
      onGenerate(topic, finalTone, length, finalAudience, numOutlines, sourceUrl.trim());
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-2">Create Your Blog Post</h3>
      <p className="text-sm text-slate-600 mb-6">
        Fill in the details below to generate your AI-powered blog content
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-2">
            Blog Post Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The Future of Artificial Intelligence in Healthcare"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            required
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">What would you like to write about?</p>
        </div>

        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-slate-700 mb-2">
            Writing Tone <span className="text-red-500">*</span>
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => handleToneChange(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
            required
            disabled={loading}
          >
            <option value="">Select the tone for your blog post</option>
            <option value="Professional">Professional</option>
            <option value="Casual">Casual</option>
            <option value="Friendly">Friendly</option>
            <option value="Academic">Academic</option>
            <option value="Conversational">Conversational</option>
            <option value="Technical">Technical</option>
            <option value="custom">Custom (Specify your own)</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">Choose the style that best fits your audience</p>

          {tone === 'custom' && (
            <div className="mt-3">
              <input
                type="text"
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                placeholder="e.g., Humorous, Inspirational, Educational..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">Describe your preferred writing style</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-700 mb-2">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <select
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => handleAudienceChange(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
            required
            disabled={loading}
          >
            <option value="">Select your target audience</option>
            <option value="General Public">General Public</option>
            <option value="Business Professionals">Business Professionals</option>
            <option value="Technical Experts">Technical Experts</option>
            <option value="Students">Students</option>
            <option value="Entrepreneurs">Entrepreneurs</option>
            <option value="Researchers">Researchers</option>
            <option value="custom">Custom (Specify your own)</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">Who will be reading this content?</p>

          {targetAudience === 'custom' && (
            <div className="mt-3">
              <input
                type="text"
                value={customAudience}
                onChange={(e) => setCustomAudience(e.target.value)}
                placeholder="e.g., Marketing Managers, Healthcare Professionals..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">Describe your target audience</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="numOutlines" className="block text-sm font-medium text-slate-700 mb-2">
            Number of outline sections <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="numOutlines"
            value={numOutlines}
            onChange={(e) => setNumOutlines(Number(e.target.value))}
            min={3}
            max={8}
            step={1}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            required
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">Recommended: 5–6 sections. Allowed range: 3–8.</p>
        </div>

        <div>
          <label htmlFor="length" className="block text-sm font-medium text-slate-700 mb-2">
            Post Length (words) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="length"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            min="200"
            max="3000"
            step="100"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            required
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">Recommended: 500-1500 words for optimal engagement</p>
        </div>

        <div>
          <label htmlFor="sourceUrl" className="block text-sm font-medium text-slate-700 mb-2">
            Custom Source URL (Optional)
          </label>
          <input
            type="url"
            id="sourceUrl"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">Provide a specific URL to include as a source for research</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {loading ? 'Generating...' : 'Generate Blog Post'}
        </button>
      </form>
    </div>
  );
}


