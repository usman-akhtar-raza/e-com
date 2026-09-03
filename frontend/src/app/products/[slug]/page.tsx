
export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center text-gray-400">
          Image Gallery
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Name</h1>
          <div className="text-2xl font-bold text-gray-900 mb-6">$99.99</div>
          <p className="text-gray-700 mb-6">Product description goes here. It is a very nice product.</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-md w-full md:w-auto font-medium hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
