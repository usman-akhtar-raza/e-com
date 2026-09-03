import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden bg-slate-50/50">
      {/* Subtle Mesh Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-blue-400/10 blur-3xl rounded-full -z-10"></div>

      <div className="max-w-2xl mx-auto text-center space-y-8 animate-slide-up p-10 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xl">
        <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 font-mono tracking-tighter drop-shadow-sm">
          404
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Page Not Found</h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto font-medium">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>
        <div className="pt-6">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 active:scale-95 transition-all font-bold px-8 py-4 text-base">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
