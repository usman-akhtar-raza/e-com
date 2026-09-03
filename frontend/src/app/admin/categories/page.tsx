
import { Button } from '@/components/ui/Button';

export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button>Add New Category</Button>
      </div>
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="p-8 text-center text-gray-500">
          No categories found.
        </div>
      </div>
    </div>
  );
}
