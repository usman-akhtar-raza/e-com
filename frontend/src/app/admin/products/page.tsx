
import Link from 'next/link';
import { AdminEmptyState, AdminPageHeader } from '@/components/admin/AdminPageChrome';
import { ArrowIcon, PackageIcon } from '@/components/ui/Icons';

export default function AdminProductsPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Merchandise"
        title="Product catalogue."
        description="Curate products, pricing and availability from one considered workspace."
        action={<Link href="/admin/products/new" className="admin-primary-action">Add product <ArrowIcon className="h-4 w-4" /></Link>}
      />
      <AdminEmptyState
        icon={PackageIcon}
        title="Your catalogue is ready to begin"
        description="Add your first product to start building collections, tracking inventory and taking orders."
        action={<Link href="/admin/products/new" className="admin-primary-action">Create first product <ArrowIcon className="h-4 w-4" /></Link>}
      />
    </div>
  );
}
