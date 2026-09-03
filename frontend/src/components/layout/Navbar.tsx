
'use client';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="font-bold text-2xl text-blue-600">ShopHub</Link>
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600">Products</Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600">Categories</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="text-gray-700 hover:text-blue-600 relative">
              Cart
            </Link>
            {user ? (
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 font-medium">{user.firstName}</button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white border rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-blue-600 font-medium hover:text-blue-800">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
