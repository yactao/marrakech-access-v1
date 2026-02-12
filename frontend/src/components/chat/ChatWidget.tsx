'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll auto vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input à l'ouverture
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Bienvenue chez Marrakech Access ! 🌴\n\nJe suis votre Majordome personnel. Je peux vous aider à trouver le bien idéal, organiser des expériences ou répondre à vos questions sur Marrakech.\n\nComment puis-je vous aider ?',
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: text,
        conversationId,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
      setConversationId(res.data.conversationId);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer dans un instant.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    'Villa avec piscine pour 6 personnes',
    'Que faire à Marrakech ?',
    'Excursions disponibles',
    'Riad en Médina pour couple',
  ];

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
          isOpen
            ? 'bg-dark-lighter border border-white/10 rotate-0'
            : 'bg-gold hover:bg-gold-dark hover:scale-110'
        }`}
      >
        {isOpen ? (
          <span className="text-white/60 text-xl">✕</span>
        ) : (
          <span className="text-dark text-2xl">🎩</span>
        )}
      </button>

      {/* Fenêtre de chat */}
      <div className={`fixed bottom-24 right-6 z-50 w-[360px] md:w-[400px] transition-all duration-500 ${
        isOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-dark-light border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
             style={{ height: '550px' }}>

          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 bg-dark-lighter">
            <span className="text-2xl">🎩</span>
            <div>
              <h3 className="font-playfair text-sm font-semibold text-gold">Majordome</h3>
              <p className="text-[10px] text-white/30">Votre concierge personnel IA</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-white/30">En ligne</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gold/15 text-white/90 border border-gold/20'
                    : 'bg-dark-lighter text-white/70 border border-white/5'
                }`}>
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-dark-lighter border border-white/5 rounded-lg px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            {/* Suggestions (uniquement si 1 seul message = bienvenue) */}
            {messages.length === 1 && !loading && (
              <div className="space-y-2">
                <p className="text-[10px] text-white/20 uppercase tracking-wider">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(s);
                        setTimeout(() => {
                          setInput('');
                          setMessages((prev) => [...prev, { role: 'user', content: s }]);
                          setLoading(true);
                          api.post('/chat', { message: s, conversationId })
                            .then((res) => {
                              setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
                              setConversationId(res.data.conversationId);
                            })
                            .catch(() => {
                              setMessages((prev) => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue.' }]);
                            })
                            .finally(() => setLoading(false));
                        }, 100);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-gold/20 text-gold/60 hover:border-gold/50 hover:text-gold transition-all duration-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5 bg-dark-lighter">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..."
                disabled={loading}
                className="flex-1 bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:border-gold/40 focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-lg bg-gold hover:bg-gold-dark disabled:bg-white/5 disabled:text-white/10 text-dark flex items-center justify-center transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}