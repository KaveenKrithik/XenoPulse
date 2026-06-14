"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// Minimalist Mascot SVG (Abstract Isometric Shape)
const MascotIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export default function Copilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "I am XenoPilot. How can I assist you with the CRM today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to the real Convex backend action
  const askCopilot = useAction(api.copilot.ask);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const history = newMessages.slice(1, -1).map(m => ({ role: m.role, content: m.content }));
      
      const response = await askCopilot({
        message: input,
        history
      });

      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), role: "assistant", content: response }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), role: "assistant", content: "I encountered an error processing your request." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button - Minimalist */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center justify-end">
        <motion.button
          id="tour-copilot"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
          }}
          className={`w-12 h-12 rounded bg-[#111] text-[#EDEDED] border border-[#333] shadow-lg flex items-center justify-center transition-opacity ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <MascotIcon className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Chat Window - Monochrome/Notion Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full h-[100dvh] md:w-[380px] md:h-[550px] bg-[#0A0A0A] md:border border-[#333] md:rounded-lg shadow-2xl flex flex-col overflow-hidden z-[60]"
          >
            {/* Header */}
            <div className="h-14 border-b border-[#333] flex items-center justify-between px-4 bg-[#0A0A0A]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <MascotIcon className="w-4 h-4 text-[#EDEDED]" />
                </div>
                <span className="font-semibold text-sm text-[#EDEDED] tracking-tight">XenoPilot</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded text-[#888] hover:bg-[#111] hover:text-[#EDEDED] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-md ${
                      msg.role === 'user' 
                        ? 'bg-[#EDEDED] text-[#0A0A0A]' 
                        : 'bg-[#111] text-[#EDEDED] border border-[#333]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#111] border border-[#333] rounded-md px-4 py-3 flex items-center gap-1.5">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 h-1.5 rounded-full bg-[#888]" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#888]" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#888]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#0A0A0A] border-t border-[#333]">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full bg-[#111] border border-[#333] rounded pl-3 pr-10 py-2.5 text-[13px] text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#666] transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 w-7 h-7 flex items-center justify-center text-[#888] hover:text-[#EDEDED] hover:bg-[#222] rounded disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
