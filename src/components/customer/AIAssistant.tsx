import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { fetchMenuItems } from '../../services/db';
import { sendToGemini } from '../../services/ai';
import type { MenuItem } from '../../types';
import { X, Send, Bot, Sparkles, Plus } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: MenuItem[];
}

const AIAssistant: React.FC = () => {
  const { isAIAssistantOpen, setIsAIAssistantOpen, addToCart, restaurant } = useAppContext();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your menu assistant. Tell me what you're in the mood for — diet, flavour, budget, anything.",
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isAIAssistantOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || !restaurant || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const allItems = await fetchMenuItems(restaurant.id, true);
      const history = updatedMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      
      const responseText = await sendToGemini(userMsg.content, history, allItems);

      // Attempt to extract recommended items by matching names from the response text
      const recommendations = allItems.filter((item: any) => 
        responseText.toLowerCase().includes(item.name.toLowerCase())
      );

      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseText,
        recommendations: recommendations.length > 0 ? recommendations : undefined
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      console.error('Failed to get AI response:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I could not connect. Please try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsAIAssistantOpen(false)}
      />

      {/* Assistant Sheet */}
      <div className="relative bg-white w-full h-[75%] rounded-t-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500 ease-out">
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-surface-container rounded-full" />
        </div>

        {/* Header */}
        <header className="px-5 pb-4 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                AI Assistant
                <Sparkles size={16} className="text-secondary" />
              </h2>
              <p className="text-[10px] font-bold text-[#707971] uppercase tracking-wider">Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={() => setIsAIAssistantOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <X size={20} className="text-[#191C19]" />
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-none">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-[#F5F0E8] text-[#191C19] border border-[#E8E1D5] rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>

              {msg.recommendations && (
                <div className="w-full mt-4 space-y-3">
                  {msg.recommendations.map((dish) => (
                    <div key={dish.id} className="bg-white border border-surface-container rounded-2xl p-3 flex gap-3 shadow-sm">
                      <img
                        src={dish.photo_url ?? undefined}
                        alt={dish.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-[#191C19] line-clamp-1">{dish.name}</h4>
                            <span className="text-sm font-bold text-primary">{formatPrice(dish.price)}</span>
                          </div>
                          <p className="text-[10px] text-[#707971] line-clamp-2 mt-1">{dish.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            addToCart({ ...dish, quantity: 1 });
                            alert(`Added ${dish.name} to order!`);
                          }}
                          className="mt-2 w-full py-1.5 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 hover:bg-primary/10 transition-colors"
                        >
                          <Plus size={12} />
                          Add to order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-[#F5F0E8] border border-[#E8E1D5] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#707971] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#707971] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#707971] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-surface-container bg-white pb-10">
          <div className="flex items-center gap-2 bg-background rounded-2xl px-4 py-2 border border-surface-container shadow-inner">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-[#707971]/50 py-2"
              placeholder="Ask me anything about the menu..."
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
