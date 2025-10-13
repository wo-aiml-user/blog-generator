import { FileText, Loader2, BookOpen, Copy, Check, Edit3, Save, Image as ImageIcon } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  editedContent: string;
  setEditedContent: (content: string) => void;
  generatedImages: string[] | null;
  imagePrompt: string | null;
  sessionId: string;
  onImageRegenerate?: (feedback: string) => void;
}

interface ArticleWithImageProps {
  htmlContent: string;
  generatedImages: string[] | null;
  imageEditMode: boolean;
  imageFeedback: string;
  isRegeneratingImage: boolean;
  onImageEditToggle: () => void;
  onImageFeedbackChange: (feedback: string) => void;
  onImageRegenerate: () => void;
}

function ArticleWithImage({
  htmlContent,
  generatedImages,
  imageEditMode,
  imageFeedback,
  isRegeneratingImage,
  onImageEditToggle,
  onImageFeedbackChange,
  onImageRegenerate,
}: ArticleWithImageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentParts, setContentParts] = useState<{ before: string; after: string }>({ before: '', after: '' });

  useEffect(() => {
    if (!htmlContent) return;

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Get all paragraphs
    const paragraphs = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
    
    // Find the middle point (after ~40% of content)
    const insertAfterIndex = Math.floor(paragraphs.length * 0.4);
    
    if (paragraphs.length > 3 && insertAfterIndex > 0) {
      const insertPoint = paragraphs[insertAfterIndex];
      
      // Split content at the insertion point
      const beforeContent: Node[] = [];
      const afterContent: Node[] = [];
      let foundInsertPoint = false;
      
      Array.from(tempDiv.childNodes).forEach((node) => {
        if (node === insertPoint || foundInsertPoint) {
          foundInsertPoint = true;
          afterContent.push(node.cloneNode(true));
        } else {
          beforeContent.push(node.cloneNode(true));
        }
      });
      
      const beforeDiv = document.createElement('div');
      const afterDiv = document.createElement('div');
      beforeContent.forEach(node => beforeDiv.appendChild(node));
      afterContent.forEach(node => afterDiv.appendChild(node));
      
      setContentParts({
        before: beforeDiv.innerHTML,
        after: afterDiv.innerHTML,
      });
    } else {
      // If content is too short, put image at the end
      setContentParts({
        before: htmlContent,
        after: '',
      });
    }
  }, [htmlContent]);

  return (
    <div ref={contentRef}>
      <div dangerouslySetInnerHTML={{ __html: contentParts.before }} />
      
      {generatedImages && generatedImages.length > 0 && (
        <div className="my-8">
          <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
            <img 
              src={generatedImages[0]} 
              alt="Generated blog image"
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={onImageEditToggle}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
              title={imageEditMode ? "Cancel" : "Edit image"}
            >
              {imageEditMode ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Image</span>
                </>
              )}
            </button>
          </div>

          {imageEditMode && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image Feedback
              </label>
              <textarea
                value={imageFeedback}
                onChange={(e) => onImageFeedbackChange(e.target.value)}
                placeholder="Describe how you'd like to change or regenerate the image..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={3}
              />
              <button
                onClick={onImageRegenerate}
                disabled={!imageFeedback.trim() || isRegeneratingImage}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRegeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>Regenerate Image</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      <div dangerouslySetInnerHTML={{ __html: contentParts.after }} />
    </div>
  );
}

export default function ContentDisplay({
  stage,
  loading,
  outlines,
  draftArticle,
  editedContent,
  setEditedContent,
  generatedImages,
  imagePrompt,
  sessionId,
  onImageRegenerate,
}: ContentDisplayProps) {
  const [copiedOutlines, setCopiedOutlines] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [imageEditMode, setImageEditMode] = useState(false);
  const [imageFeedback, setImageFeedback] = useState('');
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const articleContentRef = useRef<HTMLDivElement>(null);

  // Configure marked options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
  });

  // Parse and sanitize markdown content
  const sanitizedHtml = useMemo(() => {
    if (!draftArticle?.content) return '';
    const rawHtml = marked.parse(draftArticle.content) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [draftArticle?.content]);

  const copyOutlinesToClipboard = () => {
    if (!outlines) return;
    
    let text = `${outlines.title}\n\n`;
    outlines.outlines.forEach((section, index) => {
      text += `${index + 1}. ${section.section}\n${section.description}\n\n`;
    });
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedOutlines(true);
      setTimeout(() => setCopiedOutlines(false), 2000);
    });
  };

  const copyDraftToClipboard = () => {
    if (!draftArticle) return;
    
    let text = draftArticle.content;
    
    if (draftArticle.citations && draftArticle.citations.length > 0) {
      text += '\n\n---\n\nReferences:\n';
      draftArticle.citations.forEach((citation, index) => {
        text += `[${index + 1}] ${citation.title}\n${citation.url}\n`;
        if (citation.relevance) {
          text += `${citation.relevance}\n`;
        }
        text += '\n';
      });
    }
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
    });
  };

  const handleImageRegenerate = async () => {
    if (!imageFeedback.trim() || !onImageRegenerate) return;
    
    setIsRegeneratingImage(true);
    try {
      await onImageRegenerate(imageFeedback);
      setImageFeedback('');
      setImageEditMode(false);
    } catch (error) {
      console.error('Error regenerating image:', error);
    } finally {
      setIsRegeneratingImage(false);
    }
  };
  if (stage === 'form') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center animate-fadeInUp">
        <div className="w-24 h-24 gradient-blue rounded-3xl flex items-center justify-center mb-8 shadow-lg animate-float">
          <FileText className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-slate-900 mb-4">Ready to Create?</h3>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900">{outlines.title}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={copyOutlinesToClipboard}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border-2 border-indigo-200 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-sm"
                title="Copy outlines to clipboard"
              >
                {copiedOutlines ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span></span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-full font-semibold shadow-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>Generated</span>
              </div>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Draft Article</h2>
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={copyDraftToClipboard}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border-2 border-indigo-200 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-sm"
                title="Copy article to clipboard"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span></span>
                  </>
                )}
              </button>
              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
                title={editMode ? "Save changes" : "Edit article"}
              >
                {editMode ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full font-semibold shadow-sm">
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

        <article className="markdown-content" ref={articleContentRef}>
          {editMode ? (
            <ReactQuill
              value={editedContent}
              onChange={setEditedContent}
              theme="snow"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ],
              }}
            />
          ) : (
            <ArticleWithImage 
              htmlContent={editedContent || sanitizedHtml}
              generatedImages={generatedImages}
              imageEditMode={imageEditMode}
              imageFeedback={imageFeedback}
              isRegeneratingImage={isRegeneratingImage}
              onImageEditToggle={() => setImageEditMode(!imageEditMode)}
              onImageFeedbackChange={setImageFeedback}
              onImageRegenerate={handleImageRegenerate}
            />
          )}
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
