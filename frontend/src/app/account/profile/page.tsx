'use client';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="animate-slide-up">
      <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-8">
        Profile Settings
      </h1>
      <form className="space-y-6 max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-8 shadow-sm">
        <div className="space-y-5">
          <Input
            label="First Name"
            defaultValue={user?.firstName}
          />
          <Input
            label="Last Name"
            defaultValue={user?.lastName}
          />
          <Input
            label="Email Address"
            defaultValue={user?.email}
            readOnly
            disabled
          />
        </div>
        <div className="pt-2">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 shadow-sm hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all duration-300 font-bold">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
