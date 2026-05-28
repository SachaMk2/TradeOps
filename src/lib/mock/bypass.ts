// Check if we're in dev bypass mode (no Supabase needed)
export function isDevBypass(): boolean {
  return process.env.DEV_BYPASS_AUTH === 'true';
}
