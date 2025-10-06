import { FileText, Loader2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface OutlineSection {
  section: string;
  description: string;
}

interface Outlines {
  title: string;
  outlines: OutlineSection[];
}

interface Citation {
  title: string;
  url: string;
  relevance: string;
}

interface DraftArticle {
  title: string;
  content: string;
  citations: Citation[];
}

interface ContentDisplayProps {
  stage: 'form' | 'outlines' | 'draft';
  loading: boolean;
  outlines: Outlines | null;
  draftArticle: DraftArticle | null;
}

export default function ContentDisplay({
  stage,
  loading,
  outlines,
  draftArticle,
}: ContentDisplayProps) {
  if (stage === 'form') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">Ready to Generate Content</h3>
        <p className="text-slate-600 max-w-md">
          Your generated blog post content will appear here. Fill out the form on the left and
          click "Generate Blog Post" to get started.
        </p>
      </div>
    );
  }

  if (loading && !outlines && !draftArticle) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Generating your content...</p>
      </div>
    );
  }

  if (stage === 'outlines' && outlines) {
    return (
      <div className="overflow-y-auto max-h-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">{outlines.title}</h2>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Generated</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Generated on {new Date().toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Content Structure</h3>
          </div>

          <div className="space-y-4">
            {outlines.outlines.map((section, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2">{section.section}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{section.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'draft' && draftArticle) {
    return (
      <div className="overflow-y-auto max-h-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Draft Article</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>Draft Ready</span>
              </div>
              <div className="text-slate-500">~{draftArticle.content.split(/\s+/).length} words</div>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Generated on {new Date().toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        <article className="prose prose-slate max-w-none mb-8">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-slate-900 mb-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3" {...props} />,
              p: ({ node, ...props }) => <p className="text-slate-700 leading-relaxed mb-4" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-700" {...props} />,
              li: ({ node, ...props }) => <li className="ml-4" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
              em: ({ node, ...props }) => <em className="italic" {...props} />,
            }}
          >
            {draftArticle.content}
          </ReactMarkdown>
        </article>

        {draftArticle.citations && draftArticle.citations.length > 0 && (
          <div className="border-t border-slate-200 pt-6 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">References & Citations</h3>
            </div>
            <div className="space-y-3">
              {draftArticle.citations.map((citation, index) => (
                <div key={index} className="flex gap-3 text-sm">
                  <span className="text-slate-500 font-medium">[{index + 1}]</span>
                  <div className="flex-1">
                    <a 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      {citation.title}
                    </a>
                    {citation.relevance && (
                      <p className="text-slate-600 text-xs mt-1">{citation.relevance}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
