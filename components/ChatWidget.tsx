
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, TrendingUp, Info } from 'lucide-react';
import { startGardenChat } from '../services/geminiService';
import { Plant, ChatMessage } from '../types';

interface ChatWidgetProps {
  currentPlant?: Plant;
  allPlants: Plant[];
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ currentPlant, allPlants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "Hello! I'm your PlantOps Orchestrator. How can I help your garden grow today?" }] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset chat when plant context changes significantly
  useEffect(() => {
    const session = startGardenChat({ currentPlant, allPlants });
    setChatSession(session);
  }, [currentPlant?.id]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSession) return;

    const userMsg: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessageStream({ message: input });
      
      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);
      
      for await (const chunk of response) {
        fullText += chunk.text;
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          lastMsg.parts[0].text = fullText;
          return newMsgs;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I'm sorry, I encountered an error connecting to my botanical database." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl shadow-emerald-200 transition-all active:scale-95 group relative"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white animate-pulse" />
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white w-[380px] h-[550px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Garden Orchestrator</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Turbo Core Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context Info */}
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
               <Info className="w-3 h-3 text-emerald-600 flex-shrink-0" />
               <span className="text-[10px] text-emerald-800 font-medium truncate">
                 {currentPlant ? `Context: Analyzing ${currentPlant.name}` : `Context: All ${allPlants.length} Plants`}
               </span>
            </div>
            {currentPlant && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold whitespace-nowrap">
                <TrendingUp className="w-3 h-3" /> Trajectory Ready
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.parts[0].text || (isLoading && i === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : '')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about health or growth..."
                className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 p-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1 uppercase tracking-tighter font-bold">
              <Sparkles className="w-2.5 h-2.5 text-indigo-400" /> Botanical AI Analysis Powered by Gemini
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
