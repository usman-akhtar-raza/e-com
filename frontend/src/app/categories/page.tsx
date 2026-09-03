export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tight">All Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-2xl mb-6 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600">
                C
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Category {i}</h2>
            <p className="text-slate-500 text-sm font-medium">Explore items in Category {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
