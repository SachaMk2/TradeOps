import Link from 'next/link';
import { BookOpen, Video, Wrench, Rocket, Check, Lock, ChevronRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0B0510] text-foreground selection:bg-primary/30">
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SACH MK2</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Se connecter
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Rejoindre le club
            </Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Plateforme en direct
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
            L'outil ultime des <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary">
              Traders Rentables
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12">
            Rejoignez l'élite. Accédez à notre journal de trading avancé, nos statistiques institutionnelles et nos outils exclusifs. Transformez votre trading aujourd'hui.
          </p>

          {/* Pricing Highlight */}
          <div className="mb-12 flex flex-col items-center">
            <div className="glass px-8 py-6 rounded-2xl border border-primary/30 bg-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-2 justify-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">Offre Limitée</span>
              </div>
              <div className="flex items-baseline gap-3 justify-center">
                <span className="text-2xl text-muted-foreground line-through decoration-red-500/50">29.99€</span>
                <span className="text-5xl font-extrabold text-white">9.99€<span className="text-xl text-white/60 font-medium">/mois</span></span>
              </div>
              <p className="text-sm text-white/70 mt-2">Accès complet à la plateforme SACH MK2</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                Démarrer maintenant
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-32 border-t border-white/5 pt-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Nos <span className="text-[#8B5CF6]">Avantages</span>
            </h2>
            <p className="text-white/60">Découvrez ce qui rend l'académie SACH MK2 unique dans l'industrie du trading.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#6D28D9] to-[#4C1D95] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(109,40,217,0.3)] group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Formation Complète</h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
                Apprenez des méthodologies de trading avancées avec un programme structuré pour vous permettre d'atteindre vos objectifs plus rapidement.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#6D28D9] to-[#4C1D95] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(109,40,217,0.3)] group-hover:scale-110 transition-transform duration-300">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Lives Quotidiens</h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
                Assistez chaque jour à des sessions de trading en direct où vous pouvez observer l'exécution de chaque position en temps réel, interagir directement et poser toutes vos questions — la meilleure façon d'apprendre concrètement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#6D28D9] to-[#4C1D95] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(109,40,217,0.3)] group-hover:scale-110 transition-transform duration-300">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Outils Avancés</h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
                Accédez à un journal de trading complet pour suivre vos statistiques et habitudes, un système de backtesting avancé pour optimiser vos stratégies en comparant différents scénarios, un calculateur de contrats et bien plus encore.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section ("Adhère au club") */}
        <section className="w-full px-6 py-24 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Adhère au club</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Choisis la formule qui te convient. Les deux donnent un accès complet à la plateforme et au Discord VIP.
            </p>
          </div>

          <div className="flex justify-center">
            {/* Starter Plan Card */}
            <div className="relative w-full max-w-[420px] rounded-3xl bg-[#13091B]/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl overflow-hidden group hover:border-primary/50 transition-colors duration-500">
              {/* Top accent glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-[#6D28D9] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-[0_0_20px_rgba(109,40,217,0.5)]">
                  OFFRE MENSUELLE
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 mt-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Starter</h3>
                  <p className="text-xs text-white/50">Paiement mensuel — accès limité</p>
                </div>
              </div>

              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">180€</span>
                <span className="text-xs text-white/50">Crédite 30 jours d'accès à ton compteur</span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Inclus dans l'offre</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span className="text-sm text-white/80 font-medium">Accès aux lives Discord (sans accès au canaux VIP)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span className="text-sm text-white/80 font-medium">Accès à la section Outils SACH MK2 avec checklist personnelle</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    Sections non incluses
                    <Lock className="w-3 h-3" />
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Accès complet à la plateforme SACH MK2',
                      'Accès aux canaux VIP du Discord (rôle VIP)',
                      'Accès aux lives quotidiens',
                      'Modules de formation complets, structure établie',
                      'Journal de trading avancé',
                      'Système de backtesting avec tableaux de statistiques',
                      'Bilans journaliers avec image de chaque trade',
                      'Statistiques des meilleurs setups SACH MK2 mensuellement',
                      'Rediffusions des lives'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 opacity-40">
                        <Lock className="w-4 h-4 text-white shrink-0 mt-0.5" />
                        <span className="text-sm text-white font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/login" className="block w-full">
                  <Button className="w-full bg-[#1C1225] hover:bg-[#2A1C36] text-white/80 hover:text-white border border-white/5 h-12 rounded-xl text-sm font-semibold transition-all">
                    Fermé
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-white/40 text-sm">
        <p>© {new Date().getFullYear()} SACH MK2. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
