import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Send, Loader2, FileText, CheckCircle2, Home } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import BlogForm from '../components/BlogForm';
import ChatInterface from '../components/ChatInterface';
import ContentDisplay from '../components/ContentDisplay';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type Stage = 'form' | 'outlines' | 'draft';

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

export default function BlogGenerationPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('form');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [outlines, setOutlines] = useState<Outlines | null>(null);
  const [draftArticle, setDraftArticle] = useState<DraftArticle | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string; time: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize session and load session data
  useEffect(() => {
    const storedSessionId = localStorage.getItem('blogGeneratorSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Load session-specific data
      try {
        const sessionKey = `blogGenerator_${storedSessionId}`;
        const stored = localStorage.getItem(sessionKey);
        if (stored) {
          const data = JSON.parse(stored);
          setChatMessages(data.chatMessages || []);
          setStage(data.stage || 'form');
          setCurrentStep(data.currentStep || 1);
          setOutlines(data.outlines || null);
          setDraftArticle(data.draftArticle || null);
          setEditedContent(data.editedContent || '');
          setGeneratedImages(data.generatedImages || null);
          setImagePrompt(data.imagePrompt || null);
          setFollowUpQuestion(data.followUpQuestion || '');
        }
      } catch (error) {
        console.error('Error loading session data from localStorage:', error);
      }
    } else {
      const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(id);
      localStorage.setItem('blogGeneratorSessionId', id);
    }
    setIsLoadingSession(false);
  }, []);

  // Save session data whenever it changes (but not during initial load)
  useEffect(() => {
    if (sessionId && !isLoadingSession) {
      const sessionKey = `blogGenerator_${sessionId}`;
      const sessionData = {
        chatMessages,
        stage,
        currentStep,
        outlines,
        draftArticle,
        editedContent,
        generatedImages,
        imagePrompt,
        followUpQuestion,
      };
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }
  }, [sessionId, chatMessages, stage, currentStep, outlines, draftArticle, followUpQuestion, isLoadingSession]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (draftArticle?.content && !editedContent) {
      // Convert markdown to HTML for editing
      const html = marked.parse(draftArticle.content) as string;
      setEditedContent(html);
    }
  }, [draftArticle, editedContent]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleGenerate = async (topic: string, tone: string, length: number, targetAudience: string, numOutlines: number, keywords: string, referenceUrls: string[], customUrls: string[]) => {
    setLoading(true);
    setStage('outlines');
    setCurrentStep(1);
    setStatusMessage('Generating outlines...');

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          topic,
          tone,
          length,
          target_audience: targetAudience,
          num_outlines: numOutlines,
          keywords,
          reference_urls: referenceUrls.length > 0 ? referenceUrls : null,
          custom_urls: customUrls.length > 0 ? customUrls : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate outlines');
      }

      const data = await response.json();
      console.log('Generate API Response:', data);

      if (data.outlines_json) {
        setOutlines(data.outlines_json);
        setFollowUpQuestion(data.follow_up_question || '');
        setCurrentStep(2);
        setStatusMessage('Step 1: Outlines Generated');

        const sectionCount = data.outlines_json.outlines?.length || 0;
        setChatMessages([{
          role: 'ai',
          content: `Great! I've created an outline for your blog post about "${topic}" with a ${tone.toLowerCase()} tone.\n\nThe structure includes ${sectionCount} main sections.\n\n${data.follow_up_question || 'Would you like to proceed with this outline?'}`,
          time: getCurrentTime(),
        }]);
      } else {
        throw new Error('No outlines generated');
      }
    } catch (error) {
      console.error('Error generating outlines:', error);
      setStatusMessage('Error generating outlines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewBlog = () => {
    // Clear current session from localStorage
    if (sessionId) {
      const sessionKey = `blogGenerator_${sessionId}`;
      localStorage.removeItem(sessionKey);
    }
    
    // Generate new session ID
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.setItem('blogGeneratorSessionId', newSessionId);
    
    // Reset all state
    setStage('form');
    setCurrentStep(1);
    setLoading(false);
    setStatusMessage('');
    setFollowUpQuestion('');
    setOutlines(null);
    setDraftArticle(null);
    setEditedContent('');
    setGeneratedImages(null);
    setImagePrompt(null);
    setChatMessages([]);
    setUserInput('');
  };

  const handleImageRegenerate = async (feedback: string) => {
    setLoading(true);
    setStatusMessage('Regenerating image...');

    try {
      const response = await fetch(`${API_BASE_URL}/regenerate_image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          image_feedback: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate image');
      }

      const data = await response.json();
      console.log('Image Regenerate API Response:', data);

      if (data.generated_images) {
        setGeneratedImages(data.generated_images);
        setImagePrompt(data.image_prompt || null);
        setStatusMessage('Image regenerated successfully');

        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: `I've regenerated the image based on your feedback: "${feedback}"`,
          time: getCurrentTime(),
        }]);
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      setStatusMessage('Error regenerating image. Please try again.');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, there was an error regenerating the image. Please try again.',
        time: getCurrentTime(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async () => {
    if (!userInput.trim() || loading) return;

    const userMessage = userInput.trim();
    setUserInput('');

    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      time: getCurrentTime(),
    }]);

    setLoading(true);
    setStatusMessage('Generating draft article...');

    try {
      const response = await fetch(`${API_BASE_URL}/user_input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_feedback: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process user input');
      }

      const data = await response.json();
      console.log('User Input API Response:', data);

      // Check if we got a draft article
      if (data.draft_article) {
        setStage('draft');
        setCurrentStep(3);
        setDraftArticle(data.draft_article);
        setGeneratedImages(data.generated_images || null);
        setImagePrompt(data.image_prompt || null);
        setFollowUpQuestion(data.follow_up_question || '');
        setStatusMessage('Step 3: Draft Generated');

        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: `Perfect! I've generated your complete blog post based on your feedback. The article includes:\n\n✓ Comprehensive introduction and conclusion\n✓ Detailed sections covering all key topics\n✓ Practical examples and insights\n✓ Professional tone\n✓ Supporting citations and references\n\n${data.follow_up_question || 'Is there anything you would like to modify?'}`,
          time: getCurrentTime(),
        }]);
      } else if (data.outlines_json) {
        // Outline was modified, update it
        setOutlines(data.outlines_json);
        setFollowUpQuestion(data.follow_up_question || '');
        setCurrentStep(2);
        setStatusMessage('Outline Updated');

        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: `I've updated the outline based on your feedback.\n\n${data.follow_up_question || 'Would you like to proceed with this updated outline?'}`,
          time: getCurrentTime(),
        }]);
      }
    } catch (error) {
      console.error('Error processing user input:', error);
      setStatusMessage('Error generating draft. Please try again.');
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, there was an error generating the draft. Please try again.',
        time: getCurrentTime(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">ContentRank</h1>
              <p className="text-xs text-slate-600 font-medium">Intelligent Content Creation</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button 
              onClick={handleCreateNewBlog}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Create Blog
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">

        <div className="flex items-center justify-center gap-8 mb-10 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className={`font-semibold ${currentStep >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>Getting Started</span>
          </div>

          <div className={`h-1 w-24 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <span className={`font-semibold ${currentStep >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>Generating Content</span>
          </div>

          <div className={`h-1 w-24 rounded-full transition-all duration-500 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              3
            </div>
            <span className={`font-semibold ${currentStep >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>Review & Refine</span>
          </div>
        </div>

        <div className="grid grid-cols-[420px,1fr] gap-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white border border-slate-200 rounded-xl overflow-y-auto h-[800px] flex flex-col shadow-sm">
            {stage === 'form' ? (
              <BlogForm onGenerate={handleGenerate} loading={loading} />
            ) : (
              <ChatInterface
                messages={chatMessages}
                statusMessage={statusMessage}
                loading={loading}
                userInput={userInput}
                onInputChange={setUserInput}
                onSubmit={handleUserSubmit}
                chatEndRef={chatEndRef}
              />
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 h-[800px] overflow-y-auto shadow-sm">
            <ContentDisplay
              stage={stage}
              loading={loading}
              outlines={outlines}
              draftArticle={draftArticle}
              editedContent={editedContent}
              setEditedContent={setEditedContent}
              generatedImages={generatedImages}
              imagePrompt={imagePrompt}
              sessionId={sessionId}
              onImageRegenerate={handleImageRegenerate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
