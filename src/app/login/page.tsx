import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const modeParam = searchParams?.mode === 'signup' ? 'signup' : 'signin';

  return (
    <div className="min-h-screen flex items-center justify-center grid-pattern relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-2/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              TradeOps
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Trading Command Center
          </p>
        </div>

        {/* Login card */}
        <div className="glass rounded-xl p-6">
          <LoginForm initialMode={modeParam} />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Private operator access only.
        </p>
      </div>
    </div>
  );
}
