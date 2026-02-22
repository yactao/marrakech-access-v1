'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCart, CartExtra } from '@/lib/CartContext';

interface Message {
  role: string;
  content: string;
  cards?: any[];
}

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

// ─── Card : bien immobilier ───────────────────────────────────────────────
function PropertyCard({ data, onChoose }: { data: any; onChoose: (d: any) => void }) {
  const { cart } = useCart();
  const isChosen = cart.propertySlug === data.slug;

  return (
    <div className="rounded-xl border border-white/10 bg-dark overflow-hidden">
      {data.coverPhoto && (
        <div className="h-28 overflow-hidden">
          <img src={data.coverPhoto} alt={data.nom} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white font-playfair">{data.nom}</p>
            <p className="text-[11px] text-white/40 mt-0.5">
              {data.type} · {data.quartier} · {data.chambres} ch.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-gold font-bold text-sm">{data.priceLowSeason?.toLocaleString()}</p>
            <p className="text-[10px] text-white/30">MAD/nuit</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Link
            href={data.lien || `/properties/${data.slug}`}
            className="flex-1 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-[11px] text-center transition-colors"
          >
            Voir la fiche
          </Link>
          <button
            onClick={() => onChoose(data)}
            disabled={isChosen}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
              isChosen
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-gold hover:bg-gold-dark text-dark'
            }`}
          >
            {isChosen ? '✓ Choisi' : 'Choisir →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card : expérience / extra ────────────────────────────────────────────
function ExtraCard({ data, onAdd }: { data: any; onAdd: (d: any) => void }) {
  const { cart } = useCart();
  const isInCart = cart.extras.some((e) => e.id === data.id);

  return (
    <div className="rounded-xl border border-white/10 bg-dark overflow-hidden">
      <div className="flex gap-3 p-3">
        {data.photo && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img src={data.photo} alt={data.nom} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white font-playfair truncate">{data.nom}</p>
          <p className="text-[11px] text-white/40 mt-0.5 line-clamp-2">{data.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gold text-sm font-bold">{data.prix}</span>
            <button
              onClick={() => onAdd(data)}
              disabled={isInCart}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                isInCart
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-gold hover:bg-gold-dark text-dark'
              }`}
            >
              {isInCart ? '✓ Ajouté' : '+ Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card : bien ajouté au panier par l'IA (add_to_cart tool) ─────────────
function CartPropertyCard({ data, setProperty, setDates, setGuests }: {
  data: any;
  setProperty: (p: any) => void;
  setDates: (ci: string, co: string) => void;
  setGuests: (g: number) => void;
}) {
  const [applied, setApplied] = useState(false);

  const apply = () => {
    setProperty(data.property);
    if (data.dates) setDates(data.dates.checkIn, data.dates.checkOut);
    if (data.guests) setGuests(data.guests);
    setApplied(true);
  };

  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
      <p className="text-xs font-semibold text-gold mb-1">🏠 {data.property?.name}</p>
      {data.dates && (
        <p className="text-[11px] text-white/50 mb-2">
          {data.dates.checkIn} → {data.dates.checkOut} · {data.dates.nights} nuits · {data.guests} voy.
        </p>
      )}
      {data.estimatedTotal && (
        <p className="text-[11px] text-white/40 mb-2">Estimation : {data.estimatedTotal}</p>
      )}
      <div className="flex gap-2">
        <Link
          href={`/properties/${data.property?.slug}`}
          className="flex-1 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-[11px] text-center"
        >
          Voir la fiche
        </Link>
        <button
          onClick={apply}
          disabled={applied}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
            applied
              ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
              : 'bg-gold hover:bg-gold-dark text-dark'
          }`}
        >
          {applied ? '✓ Dans le panier' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}

// ─── Card : extra ajouté au panier par l'IA ───────────────────────────────
function CartExtraCard({ data, addExtra }: { data: any; addExtra: (e: CartExtra) => void }) {
  const { cart } = useCart();
  const isInCart = cart.extras.some((e) => e.id === data.extra?.id);

  const apply = () => {
    if (!data.extra) return;
    addExtra({
      id: data.extra.id,
      name: data.extra.name,
      category: data.extra.category,
      price: data.extra.price,
      priceUnit: data.extra.priceUnit,
      quantity: data.extra.quantity || 1,
    });
  };

  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
      <p className="text-xs font-semibold text-gold mb-1">✨ {data.extra?.name}</p>
      <p className="text-[11px] text-white/40 mb-2">
        {data.extra?.price?.toLocaleString()} MAD/{data.extra?.priceUnit}
        {data.extra?.quantity > 1 && ` × ${data.extra.quantity}`}
      </p>
      <button
        onClick={apply}
        disabled={isInCart}
        className={`w-full py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
          isInCart
            ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
            : 'bg-gold hover:bg-gold-dark text-dark'
        }`}
      >
        {isInCart ? '✓ Dans le panier' : '+ Ajouter au panier'}
      </button>
    </div>
  );
}

// ─── Widget principal ─────────────────────────────────────────────────────
export default function ChatWidget() {
  const pathname = usePathname();
  const { cart, setProperty, setDates, setGuests, addExtra } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [proactiveBubble, setProactiveBubble] = useState('');
  const [showProactive, setShowProactive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isTypingGreeting, setIsTypingGreeting] = useState(false);
  const [pulseButton, setPulseButton] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(isOpen);
  const recognitionRef = useRef<any>(null);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

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

  // Écouter l'event chat:open (déclenché depuis les pages bien/extras)
  useEffect(() => {
    const handleChatOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      if (!isOpenRef.current) {
        handleOpen();
      }
      if (detail?.message) {
        setTimeout(() => {
          setInput(detail.message!);
          inputRef.current?.focus();
        }, 400);
      }
    };
    window.addEventListener('chat:open', handleChatOpen);
    return () => window.removeEventListener('chat:open', handleChatOpen);
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
      const { data } = await api.post('/chat', { message: messageText, conversationId });
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply,
        cards: data.cards || [],
      }]);
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

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      inputRef.current?.focus();
    };

    recognition.onerror = () => setIsListening(false);

    recognition.start();
  };

  const handleChooseProperty = (data: any) => {
    setProperty({
      id: data.id,
      name: data.nom,
      slug: data.slug,
      district: data.quartier,
      type: data.type,
      priceLowSeason: data.priceLowSeason,
      currency: data.currency || 'MAD',
      cleaningFee: data.cleaningFee || 0,
      capacity: data.capacite,
      minNights: data.nuits_minimum || 1,
    });
    sendMessage(`J'ai choisi "${data.nom}". Pouvez-vous vérifier les disponibilités ?`);
  };

  const handleAddExtra = (data: any) => {
    addExtra({
      id: data.id,
      name: data.nom,
      category: data.categorie,
      price: data.price,
      priceUnit: data.priceUnit,
      quantity: 1,
    });
    sendMessage(`Parfait, j'ai ajouté "${data.nom}" à mon panier.`);
  };

  const renderCards = (cards: any[]) => {
    if (!cards || cards.length === 0) return null;
    return (
      <div className="mt-3 space-y-2">
        {cards.map((card, i) => {
          if (card.type === 'property') {
            return <PropertyCard key={i} data={card.data} onChoose={handleChooseProperty} />;
          }
          if (card.type === 'extra') {
            return <ExtraCard key={i} data={card.data} onAdd={handleAddExtra} />;
          }
          if (card.type === 'cart_property') {
            return (
              <CartPropertyCard
                key={i}
                data={card.data}
                setProperty={setProperty}
                setDates={setDates}
                setGuests={setGuests}
              />
            );
          }
          if (card.type === 'cart_extra') {
            return <CartExtraCard key={i} data={card.data} addExtra={addExtra} />;
          }
          return null;
        })}
      </div>
    );
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
          <div className="relative bg-gradient-to-br from-dark-light to-dark border border-gold/30 rounded-2xl rounded-br-sm p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#8B0000] flex items-center justify-center flex-shrink-0 shadow-md border border-gold/20">
                <span className="text-lg">🎩</span>
              </div>
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
              : 'bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/50 hover:border-gold hover:scale-110 hover:shadow-gold/30 hover:shadow-xl'
          }`}
        >
          {isOpen ? (
            <span className="text-white/60 text-xl">✕</span>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#8B0000] flex items-center justify-center animate-float shadow-lg">
                <span className="text-2xl">🎩</span>
              </div>
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
        <div
          className="fixed bottom-24 right-6 z-[70] w-[380px] max-h-[600px] rounded-2xl overflow-hidden border border-white/10 bg-dark shadow-2xl flex flex-col"
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >

          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-dark-light to-dark border-b border-gold/10 flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#8B0000] flex items-center justify-center shadow-lg border-2 border-gold/30">
                <span className="text-xl">🎩</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-dark-light"></span>
            </div>
            <div className="flex-1">
              <h3 className="font-playfair text-base font-semibold text-gold">Al</h3>
              <p className="text-[11px] text-emerald-400 font-inter flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Votre majordome • En ligne
              </p>
            </div>
            {cart.propertyId && (
              <Link
                href="/checkout"
                className="text-[10px] bg-gold/10 border border-gold/20 text-gold px-2 py-1 rounded-full hover:bg-gold/20 transition-colors"
              >
                🛒 Panier
              </Link>
            )}
            <span className="text-[9px] text-white/20 font-inter bg-white/5 px-2 py-1 rounded-full">IA</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">

            {isTypingGreeting && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#8B0000] flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-sm">🎩</span>
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#8B0000] flex items-center justify-center flex-shrink-0 shadow-md self-start mt-1">
                    <span className="text-sm">🎩</span>
                  </div>
                )}
                <div className={`${msg.role === 'user' ? 'max-w-[80%]' : 'flex-1 min-w-0'}`}>
                  <div
                    className={`px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gold/15 text-white/90 rounded-2xl rounded-br-sm border border-gold/10'
                        : 'bg-dark-lighter text-white/70 rounded-2xl rounded-bl-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                  />
                  {msg.role === 'assistant' && msg.cards && renderCards(msg.cards)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#8B0000] flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-sm">🎩</span>
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
            <div className="px-4 pb-2 flex-shrink-0">
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
          <div className="px-4 py-3 border-t border-white/5 bg-dark-light flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isListening ? 'Parlez maintenant...' : 'Écrivez à Al...'}
                className={`flex-1 bg-dark border rounded-full px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none transition-colors ${
                  isListening ? 'border-red-500/50 placeholder:text-red-400/60' : 'border-white/10 focus:border-gold/40'
                }`}
              />
              {/* Bouton micro */}
              <button
                onClick={toggleListening}
                title={isListening ? 'Arrêter' : 'Dicter'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse'
                    : 'border border-white/10 text-white/30 hover:border-gold/30 hover:text-gold/60'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6 9a1 1 0 0 1 2 0 8 8 0 0 1-7 7.93V20h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.07A8 8 0 0 1 4 10a1 1 0 0 1 2 0 6 6 0 0 0 12 0z"/>
                </svg>
              </button>
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
