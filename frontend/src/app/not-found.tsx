import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="text-6xl font-extrabold text-blue-600 font-mono">404</div>
      <h1 className="text-3xl font-extrabold text-gray-900">Page Not Found</h1>
      <p className="text-gray-500 max-w-md mx-auto">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <div className="pt-4">
        <Link href="/">
          <Button size="lg">Return to Homepage</Button>
        </Link>
      </div>
    </div>
  );
}
