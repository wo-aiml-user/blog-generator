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
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-900">AI Assistant</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-slate-600">Online</span>
          </div>
        </div>
        <p className="text-sm text-slate-600">Let's refine your blog post together</p>

        {statusMessage && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1 px-1">{message.time}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-900 px-4 py-3 rounded-lg flex items-center gap-2 border border-slate-200">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <textarea
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response or feedback..."
            rows={2}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
            disabled={loading}
          />
          <button
            onClick={onSubmit}
            disabled={loading || !userInput.trim()}
            className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
