import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-16 px-4 border-t border-white/5 bg-dark">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Logo */}
          <div>
            <h3 className="font-playfair text-xl text-gold font-bold">MARRAKECH ACCESS</h3>
            <p className="mt-2 text-white/30 text-sm">Conciergerie de luxe à Marrakech</p>
          </div>

          {/* Séjourner */}
          <div>
            <h4 className="font-inter text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Séjourner</h4>
            <div className="flex flex-col gap-2">
              <Link href="/properties" className="text-sm text-white/30 hover:text-gold transition-colors">Nos biens</Link>
              <Link href="/extras" className="text-sm text-white/30 hover:text-gold transition-colors">Expériences</Link>
              <Link href="/properties?district=Palmeraie" className="text-sm text-white/30 hover:text-gold transition-colors">Palmeraie</Link>
              <Link href="/properties?district=Médina" className="text-sm text-white/30 hover:text-gold transition-colors">Médina</Link>
            </div>
          </div>

          {/* Investir */}
          <div>
            <h4 className="font-inter text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Investir</h4>
            <div className="flex flex-col gap-2">
              <Link href="/investir" className="text-sm text-white/30 hover:text-gold transition-colors">Gestion locative</Link>
              <Link href="/investir" className="text-sm text-white/30 hover:text-gold transition-colors">Devenir partenaire</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-inter text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Contact</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-white/30">📍 Marrakech, Maroc</span>
              <span className="text-sm text-white/30">📞 +212 6 00 00 00 00</span>
              <span className="text-sm text-white/30">✉️ contact@marrakech-access.com</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-white/20 text-xs">© 2026 Marrakech Access. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}