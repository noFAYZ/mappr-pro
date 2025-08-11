import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { User } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen ">

<UserMenu />
          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
     </div>
    </ProtectedRoute>
  );
}