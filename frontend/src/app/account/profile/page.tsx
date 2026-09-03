
'use client';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      <form className="space-y-6 max-w-md">
        <Input label="First Name" defaultValue={user?.firstName} />
        <Input label="Last Name" defaultValue={user?.lastName} />
        <Input label="Email Address" defaultValue={user?.email} readOnly disabled />
        <Button>Save Changes</Button>
      </form>
    </div>
  );
}
