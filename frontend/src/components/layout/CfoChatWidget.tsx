import React, { useState, useRef, useEffect } from 'react';
import { useCfoStore } from '../../stores/cfo.store';

export const CfoChatWidget: React.FC = () => {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  
  // Pulling state and actions from the Zustand store we created
  const { chatHistory, isProcessingChat, sendUserMessage } = useCfoStore();
  
  // Used to auto-scroll to the latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (isWidgetOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isWidgetOpen, isProcessingChat]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isProcessingChat) return;
    
    const messagePayload = currentInput;
    setCurrentInput(''); // Clear input immediately for better UX
    await sendUserMessage(messagePayload);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* --- THE OPEN CHAT WINDOW --- */}
      {isWidgetOpen && (
        <div className="w-80 sm:w-96 h-[30rem] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 font-semibold flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-sm font-bold">AI CFO</h3>
                <p className="text-xs text-slate-400 font-normal">Online & ready to analyze</p>
              </div>
            </div>
            <button 
              onClick={() => setIsWidgetOpen(false)} 
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Chat History Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white self-end rounded-br-sm' 
                    : 'bg-white text-gray-800 self-start border border-gray-100 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            ))}
            
            {/* Loading / Typing Indicator */}
            {isProcessingChat && (
              <div className="bg-white text-gray-500 self-start max-w-[85%] p-4 border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
            {/* Invisible div to scroll down to */}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Form */}
          <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Ask about your runway or expenses..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50"
              disabled={isProcessingChat}
            />
            <button 
              type="submit" 
              disabled={isProcessingChat || !currentInput.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-10 h-10 shadow-sm"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* --- THE FLOATING TOGGLE BUTTON --- */}
      {!isWidgetOpen && (
        <button
          onClick={() => setIsWidgetOpen(true)}
          className="bg-slate-900 text-white rounded-full p-4 shadow-xl hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-3 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-semibold pr-2 hidden group-hover:block transition-all">Chat with Data</span>
        </button>
      )}
    </div>
  );
};