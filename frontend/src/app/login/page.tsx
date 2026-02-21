'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Champs formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'GUEST' | 'OWNER'>('GUEST');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.dispatchEvent(new Event('user-changed'));

        // Redirection selon le rôle
        if (res.data.user.role === 'ADMIN') {
          router.push('/admin');
        } else if (res.data.user.role === 'OWNER') {
          router.push('/dashboard');
        } else {
          router.push('/properties');
        }
      } else {
        const res = await api.post('/auth/register', {
          email,
          password,
          firstName,
          lastName,
          phone: phone || undefined,
          role,
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.dispatchEvent(new Event('user-changed'));

        if (res.data.user.role === 'OWNER') {
          router.push('/dashboard');
        } else {
          router.push('/properties');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-dark">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="font-playfair text-2xl text-gold tracking-[3px] uppercase">Marrakech Access</h1>
          </Link>
          <p className="mt-2 text-white/30 text-xs tracking-[2px] uppercase">
            {mode === 'login' ? 'Connexion à votre espace' : 'Créer votre compte'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-dark-light border border-white/5 rounded-xl p-6 md:p-8">

          {/* Toggle Login / Register */}
          <div className="flex mb-6 bg-dark rounded-lg p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-inter transition-all duration-300 ${
                mode === 'login' ? 'bg-gold text-dark font-semibold' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-inter transition-all duration-300 ${
                mode === 'register' ? 'bg-gold text-dark font-semibold' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Champs Register uniquement */}
            {mode === 'register' && (
              <>
                {/* Rôle */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Je suis</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('GUEST')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-inter border transition-all duration-300 ${
                        role === 'GUEST'
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-white/10 text-white/40 hover:border-white/20'
                      }`}
                    >
                      🏖️ Voyageur
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('OWNER')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-inter border transition-all duration-300 ${
                        role === 'OWNER'
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-white/10 text-white/40 hover:border-white/20'
                      }`}
                    >
                      🏠 Propriétaire
                    </button>
                  </div>
                </div>

                {/* Prénom + Nom */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Prénom</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:border-gold/50 focus:outline-none transition-colors"
                      placeholder="Ahmed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Nom</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:border-gold/50 focus:outline-none transition-colors"
                      placeholder="Tazi"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Téléphone (optionnel)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:border-gold/50 focus:outline-none transition-colors"
                    placeholder="+212 6 00 00 00 00"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:border-gold/50 focus:outline-none transition-colors"
                placeholder="votre@email.com"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:border-gold/50 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gold hover:bg-gold-dark disabled:bg-gold/50 text-dark font-inter font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span>
                  Chargement...
                </>
              ) : mode === 'login' ? (
                'Se connecter'
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          {/* Comptes de démo */}
          {mode === 'login' && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-white/20 text-center mb-3">Comptes de démonstration</p>
              <div className="space-y-2">
                {[
                  { label: '👤 Guest', email: 'pierre@guest.com' },
                  { label: '🏠 Propriétaire', email: 'youssef@proprio.com' },
                  { label: '⚙️ Admin', email: 'admin@marrakech-access.com' },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword('123456');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-dark hover:bg-dark-lighter border border-white/5 text-xs text-white/40 hover:text-white/60 transition-all duration-300 flex items-center justify-between"
                  >
                    <span>{demo.label}</span>
                    <span className="text-white/20">{demo.email}</span>
                  </button>
                ))}
                <p className="text-[10px] text-white/15 text-center mt-1">Mot de passe : 123456</p>
              </div>
            </div>
          )}
        </div>

        {/* Retour */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-white/20 hover:text-gold transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}