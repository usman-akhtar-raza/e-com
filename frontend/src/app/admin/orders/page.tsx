
import { AdminEmptyState, AdminPageHeader } from '@/components/admin/AdminPageChrome';
import { BagIcon } from '@/components/ui/Icons';

export default function AdminOrdersPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Fulfilment"
        title="Order operations."
        description="Review purchases, follow fulfilment and keep every customer order moving."
      />
      <AdminEmptyState
        icon={BagIcon}
        title="No orders to process"
        description="New purchases will appear here with customer, payment and fulfilment details."
      />
    </div>
  );
}
