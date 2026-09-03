
import { AdminEmptyState, AdminPageHeader } from '@/components/admin/AdminPageChrome';
import { GridIcon } from '@/components/ui/Icons';

export default function AdminCategoriesPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Store structure"
        title="Collections & categories."
        description="Shape how customers discover the catalogue with a clean, intentional hierarchy."
        action={<button type="button" className="admin-primary-action">Add category <span aria-hidden="true">＋</span></button>}
      />
      <AdminEmptyState
        icon={GridIcon}
        title="Create your first category"
        description="Group related products into thoughtful collections for easier browsing and discovery."
        action={<button type="button" className="admin-primary-action">Create category <span aria-hidden="true">＋</span></button>}
      />
    </div>
  );
}
