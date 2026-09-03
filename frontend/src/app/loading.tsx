import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in space-y-6">
      <div className="relative p-6 bg-white/50 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-sm">
        <LoadingSpinner />
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10 [mask-image:linear-gradient(white,white)] [-webkit-mask-image:linear-gradient(white,white)] [-webkit-mask-clip:padding-box] [mask-clip:padding-box]"></div>
      </div>
      <p className="text-slate-400 font-bold tracking-widest uppercase text-sm animate-pulse">Loading...</p>
    </div>
  );
}
