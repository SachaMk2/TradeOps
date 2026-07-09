import Link from 'next/link';
import { BookOpen, Video, Wrench, Rocket, Check, Lock, ChevronRight, BarChart3, Brain, Target, Newspaper, LineChart, ShieldCheck } from 'lucide-react';
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
          <span className="text-xl font-bold tracking-tight text-white">Rise Dash</span>
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
            Plateforme tout-en-un
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
            Élevez votre Trading <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary">
              Au Niveau Supérieur
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-12">
            Plus qu'un simple journal. Rise Dash est la plateforme complète réunissant Intelligence Artificielle, 
            statistiques institutionnelles, fil d'actualités et suivi de comptes pour propulser votre rentabilité.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                Démarrer votre ascension
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-32 pt-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Votre avantage <span className="text-primary">déloyal</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Nous avons rassemblé tous les outils dont un trader a besoin en une seule et même interface ultra-rapide et intuitive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {/* Journaling & Stats */}
            <div className="glass p-8 rounded-3xl border-white/5 hover:border-primary/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Journaling & Statistiques</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Loggez chaque trade avec captures d'écran. Analysez instantanément votre Win Rate, Profit Factor, R-Multiple et décelez vos setups les plus performants.
              </p>
            </div>

            {/* AI Analysis */}
            <div className="glass p-8 rounded-3xl border-white/5 hover:border-blue-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Analyse par IA</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Connectez votre intelligence artificielle personnelle pour passer en revue vos trades, trouver vos biais psychologiques et obtenir un feedback objectif.
              </p>
            </div>

            {/* News */}
            <div className="glass p-8 rounded-3xl border-white/5 hover:border-orange-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/30 to-red-500/10 flex items-center justify-center mb-6 border border-orange-500/20 group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Actualités Économiques</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Ne soyez plus surpris par un NFP ou un discours de la FED. Un fil d'actualité intégré et filtré en direct pour les annonces à fort impact.
              </p>
            </div>

            {/* Mind Dump */}
            <div className="glass p-8 rounded-3xl border-white/5 hover:border-pink-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/30 to-rose-500/10 flex items-center justify-center mb-6 border border-pink-500/20 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Mind Dump</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Videz votre esprit. Un espace dédié pour noter vos pensées, purger vos émotions et attacher des analyses visuelles en plein milieu de la session.
              </p>
            </div>

            {/* Account Tracking */}
            <div className="glass p-8 rounded-3xl border-white/5 hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-green-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Suivi de Comptes</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Gérez plusieurs comptes simultanément, qu'ils soient réels ou Prop Firms. Suivez vos phases d'évaluation, vos drawdowns et vos objectifs par compte.
              </p>
            </div>

            {/* Goals Tracking */}
            <div className="glass p-8 rounded-3xl border-white/5 hover:border-yellow-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-amber-500/10 flex items-center justify-center mb-6 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Objectifs & Payouts</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Fixez vos objectifs mensuels, tracez vos retraits (payouts) et construisez une discipline d'acier pour passer au niveau supérieur.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full max-w-4xl mx-auto px-6 pb-32 text-center">
          <div className="glass rounded-3xl p-12 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-50" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Prêt à dominer les marchés ?</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto relative z-10">
              Arrêtez de deviner. Commencez à mesurer. Rejoignez les traders qui utilisent Rise Dash pour bâtir leur edge statistique.
            </p>
            <Link href="/login" className="relative z-10">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                Créer mon compte maintenant
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-white/40 text-sm">
        <p>© {new Date().getFullYear()} Rise Dash. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
