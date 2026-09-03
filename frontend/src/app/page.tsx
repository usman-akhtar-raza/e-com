
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Discover Amazing Products</h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Shop the latest trends, discover exclusive deals, and elevate your everyday life with ShopHub.
          </p>
          <Link href="/products" className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-md hover:bg-gray-100 transition shadow-lg text-lg">
            Shop Now
          </Link>
        </div>
      </section>
      
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Featured Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <Link key={i} href={`/products?categoryId=${i}`} className="group relative rounded-lg overflow-hidden shadow-md bg-white aspect-square flex flex-col items-center justify-center p-6 border hover:border-blue-500 transition-colors">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
              <h3 className="font-semibold text-lg text-gray-900">Category {i}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
