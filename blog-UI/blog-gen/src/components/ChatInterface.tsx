import { Send, Loader2, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  time: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  statusMessage: string;
  loading: boolean;
  userInput: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatInterface({
  messages,
  statusMessage,
  loading,
  userInput,
  onInputChange,
  onSubmit,
  chatEndRef,
}: ChatInterfaceProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/30 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Assistant</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-700 font-semibold">Online</span>
          </div>
        </div>
        <p className="text-sm text-slate-600 font-medium">Let's refine your blog post together ✨</p>

        {statusMessage && (
          <div className="mt-4 flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 px-4 py-2.5 rounded-xl font-medium shadow-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-5 py-4 rounded-2xl shadow-sm ${
                  message.role === 'user'
                    ? 'gradient-blue text-white'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1 px-1">{message.time}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-900 px-5 py-4 rounded-2xl flex items-center gap-3 border border-slate-200 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm font-medium">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-t border-white/30">
        <div className="flex gap-2">
          <textarea
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response or feedback..."
            rows={2}
            className="flex-1 px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none bg-white shadow-sm font-medium"
            disabled={loading}
          />
          <button
            onClick={onSubmit}
            disabled={loading || !userInput.trim()}
            className="gradient-blue text-white px-6 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center hover-glow"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send or Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
