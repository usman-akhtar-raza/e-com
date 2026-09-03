
export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">All Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white border rounded-lg p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Category {i}</h2>
            <p className="text-gray-500 text-sm">Explore items in Category {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
