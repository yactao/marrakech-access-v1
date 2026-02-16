'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Messages proactifs selon la page
const proactiveMessages: Record<string, { delay: number; message: string }> = {
  '/properties': {
    delay: 5000,
    message: 'Besoin d\'aide pour choisir votre hébergement ? Je connais chaque quartier de Marrakech comme ma poche !',
  },
  '/extras': {
    delay: 4000,
    message: 'Envie d\'une expérience inoubliable ? Laissez-moi vous recommander mes pépites préférées...',
  },
  '/investir': {
    delay: 6000,
    message: 'Vous souhaitez investir à Marrakech ? Je peux vous guider sur les meilleurs quartiers et rendements.',
  },
  '/checkout': {
    delay: 3000,
    message: 'Excellent choix ! Si vous avez des demandes spéciales pour votre séjour, n\'hésitez pas.',
  },
};

// Suggestions contextuelles selon la page
const contextSuggestions: Record<string, string[]> = {
  '/': [
    'Que faire à Marrakech ?',
    'Quel quartier choisir ?',
    'Vos meilleures villas ?',
  ],
  '/properties': [
    'Villa avec piscine privée',
    'Riad authentique en Médina',
    'Budget serré, que conseilles-tu ?',
    'Idéal pour un groupe de 8',
  ],
  '/extras': [
    'Meilleure excursion en famille',
    'Chef à domicile pour 10 pers',
    'Activités romantiques en couple',
    'Que faire quand il pleut ?',
  ],
  '/investir': [
    'Rentabilité locative à Marrakech',
    'Meilleurs quartiers pour investir',
    'Comment référencer mon bien ?',
  ],
  default: [
    'Que recommandes-tu ?',
    'Cherche un bien avec piscine',
    'Quelles expériences proposez-vous ?',
    'J\'ai un problème à signaler',
  ],
};

// Greetings de Al
const greetings = [
  'Marhaba ! 🌟 Je suis **Al**, votre majordome personnel. Comment puis-je rendre votre séjour à Marrakech inoubliable ?',
  'Ahlan wa sahlan ! 🌙 Al à votre service. Que puis-je faire pour vous aujourd\'hui ?',
  'Bienvenue ! ✨ Je suis Al, expert de Marrakech depuis toujours. Posez-moi n\'importe quelle question !',
];

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [proactiveBubble, setProactiveBubble] = useState('');
  const [showProactive, setShowProactive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isTypingGreeting, setIsTypingGreeting] = useState(false);
  const [pulseButton, setPulseButton] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input quand on ouvre
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Message proactif selon la page
  useEffect(() => {
    if (hasInteracted || isOpen) return;

    const pageKey = Object.keys(proactiveMessages).find((key) => pathname.startsWith(key));
    if (!pageKey) return;

    const { delay, message } = proactiveMessages[pageKey];
    const timer = setTimeout(() => {
      setProactiveBubble(message);
      setShowProactive(true);
      setTimeout(() => setShowProactive(false), 8000);
    }, delay);

    return () => clearTimeout(timer);
  }, [pathname, hasInteracted, isOpen]);

  // Arrêter le pulse après 10s
  useEffect(() => {
    const timer = setTimeout(() => setPulseButton(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setShowProactive(false);
    setHasInteracted(true);
    setPulseButton(false);

    if (messages.length === 0) {
      setIsTypingGreeting(true);
      setTimeout(() => {
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        setMessages([{ role: 'assistant', content: greeting }]);
        setIsTypingGreeting(false);
      }, 1200);
    }
  };

  const getSuggestions = () => {
    const pageKey = Object.keys(contextSuggestions).find((key) =>
      key === '/' ? pathname === '/' : pathname.startsWith(key)
    );
    return contextSuggestions[pageKey || 'default'] || contextSuggestions['default'];
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: messageText }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: messageText, conversationId }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.conversationId) setConversationId(data.conversationId);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Oups, petit souci de connexion. Réessayez dans un instant ! 🙏',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* BULLE PROACTIVE */}
      {showProactive && !isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[60] max-w-[280px] cursor-pointer"
          onClick={handleOpen}
          style={{ animation: 'bounceIn 0.4s ease-out' }}
        >
          <div className="relative bg-dark-light border border-gold/20 rounded-2xl rounded-br-sm p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <img src="/images/fez.svg" alt="Al" className="w-8 h-8 object-contain flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-gold font-semibold mb-1">Al — Votre Majordome</p>
                <p className="text-xs text-white/70 leading-relaxed">{proactiveBubble}</p>
              </div>
            </div>
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-dark-light border-r border-b border-gold/20 rotate-45"></div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowProactive(false); }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-dark border border-white/10 text-white/40 text-[10px] flex items-center justify-center hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* BOUTON FLOTTANT */}
 {/* BOUTON FLOTTANT */}
      <div className="fixed bottom-6 right-6 z-[70]">

        {/* Ondes pulsantes (seulement si pas ouvert et pas encore interagi) */}
        {!isOpen && !hasInteracted && (
          <>
            <span className="absolute inset-0 rounded-full border border-gold/40 animate-ping-slow" />
            <span className="absolute -inset-2 rounded-full border border-gold/20 animate-ping-slower" />
            <span className="absolute -inset-4 rounded-full border border-gold/10 animate-ping-slowest" />
          </>
        )}

        {/* Texte circulaire rotatif */}
        {!isOpen && (
          <div className="absolute -inset-5 animate-spin-slow pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <path id="circlePath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
              </defs>
              <text className="fill-gold/40" style={{ fontSize: '8.5px', letterSpacing: '2.5px' }}>
                <textPath href="#circlePath">
                  ✦ VOTRE MAJORDOME ✦ DEMANDEZ-MOI ✦ 24/7
                </textPath>
              </text>
            </svg>
          </div>
        )}

        {/* Particules dorées orbitantes */}
        {!isOpen && !hasInteracted && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute w-1.5 h-1.5 bg-gold rounded-full animate-orbit-1" />
            <span className="absolute w-1 h-1 bg-gold/60 rounded-full animate-orbit-2" />
            <span className="absolute w-1.5 h-1.5 bg-gold/80 rounded-full animate-orbit-3" />
          </div>
        )}

        {/* Bouton principal */}
        <button
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
            isOpen
              ? 'bg-dark-lighter border border-white/10'
              : 'bg-dark-light border border-gold/30 hover:border-gold hover:scale-110 hover:shadow-gold/20 hover:shadow-xl'
          }`}
        >
          {isOpen ? (
            <span className="text-white/60 text-xl">✕</span>
          ) : (
            <div className="relative">
              <img
                src="/images/fez.svg"
                alt="Majordome"
                className="w-9 h-9 object-contain animate-float"
              />
              {/* Badge notification */}
              {!hasInteracted && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center">
                  <span className="absolute w-3 h-3 rounded-full bg-gold animate-ping" />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-gold" />
                </span>
              )}
            </div>
          )}
        </button>
      </div>
      {/* FENÊTRE DE CHAT */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[70] w-[380px] h-[550px] rounded-2xl overflow-hidden border border-white/10 bg-dark shadow-2xl flex flex-col"
             style={{ animation: 'slideUp 0.3s ease-out' }}>

          {/* Header */}
          <div className="px-5 py-4 bg-dark-light border-b border-white/5 flex items-center gap-3">
            <div className="relative">
              <img src="/images/fez.svg" alt="Al" className="w-10 h-10 object-contain" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-dark-light"></span>
            </div>
            <div className="flex-1">
              <h3 className="font-playfair text-sm font-semibold text-white">Al</h3>
              <p className="text-[10px] text-emerald-400 font-inter">Votre majordome • En ligne</p>
            </div>
            <span className="text-[10px] text-white/20 font-inter">Propulsé par IA</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">

            {isTypingGreeting && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-dark-lighter flex items-center justify-center flex-shrink-0">
                  <img src="/images/fez.svg" alt="M" className="w-5 h-5 object-contain" />
                </div>
                <div className="bg-dark-lighter rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-end gap-2'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-dark-lighter flex items-center justify-center flex-shrink-0">
                    <img src="/images/fez.svg" alt="M" className="w-5 h-5 object-contain" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gold/15 text-white/90 rounded-2xl rounded-br-sm border border-gold/10'
                      : 'bg-dark-lighter text-white/70 rounded-2xl rounded-bl-sm'
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-dark-lighter flex items-center justify-center flex-shrink-0">
                  <img src="/images/fez.svg" alt="M" className="w-5 h-5 object-contain" />
                </div>
                <div className="bg-dark-lighter rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && !loading && !isTypingGreeting && (
            <div className="px-4 pb-2">
              <p className="text-[10px] text-white/20 mb-2 font-inter">Suggestions :</p>
              <div className="flex flex-wrap gap-1.5">
                {getSuggestions().map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="px-3 py-1.5 rounded-full text-[11px] border border-gold/20 text-gold/60 hover:bg-gold/10 hover:text-gold hover:border-gold/40 transition-all duration-300 font-inter"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/5 bg-dark-light">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Écrivez à Al..."
                className="flex-1 bg-dark border border-white/10 rounded-full px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-full bg-gold hover:bg-gold-dark disabled:bg-white/5 disabled:text-white/20 text-dark flex items-center justify-center transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
      @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          50% { transform: scale(1.02) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.25; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes ping-slowest {
          0% { transform: scale(1); opacity: 0.15; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes orbit-1 {
          0% { top: -6px; left: 50%; transform: translateX(-50%); opacity: 1; }
          25% { top: 50%; left: calc(100% + 6px); transform: translateY(-50%); opacity: 0.8; }
          50% { top: calc(100% + 6px); left: 50%; transform: translateX(-50%); opacity: 0.6; }
          75% { top: 50%; left: -6px; transform: translateY(-50%); opacity: 0.8; }
          100% { top: -6px; left: 50%; transform: translateX(-50%); opacity: 1; }
        }
        @keyframes orbit-2 {
          0% { top: 50%; left: calc(100% + 8px); transform: translateY(-50%); }
          25% { top: calc(100% + 8px); left: 50%; transform: translateX(-50%); }
          50% { top: 50%; left: -8px; transform: translateY(-50%); }
          75% { top: -8px; left: 50%; transform: translateX(-50%); }
          100% { top: 50%; left: calc(100% + 8px); transform: translateY(-50%); }
        }
        @keyframes orbit-3 {
          0% { top: calc(100% + 4px); left: 50%; transform: translateX(-50%); }
          25% { top: 50%; left: -4px; transform: translateY(-50%); }
          50% { top: -4px; left: 50%; transform: translateX(-50%); }
          75% { top: 50%; left: calc(100% + 4px); transform: translateY(-50%); }
          100% { top: calc(100% + 4px); left: 50%; transform: translateX(-50%); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-ping-slow { animation: ping-slow 2s ease-out infinite; }
        .animate-ping-slower { animation: ping-slower 2.5s ease-out infinite 0.3s; }
        .animate-ping-slowest { animation: ping-slowest 3s ease-out infinite 0.6s; }
        .animate-orbit-1 { animation: orbit-1 4s linear infinite; }
        .animate-orbit-2 { animation: orbit-2 5s linear infinite; }
        .animate-orbit-3 { animation: orbit-3 3.5s linear infinite; }
      `}</style>
    </>
  );
}