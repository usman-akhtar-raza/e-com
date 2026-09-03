export function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center p-8 space-y-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200/50"></div>
        <div className="absolute inset-0 rounded-full border-2 border-t-blue-600 border-r-indigo-600 border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading...</span>
    </div>
  );
}
