"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@heroui/react';
import { useAuth, useAuthUtils } from '@/lib/store/auth';
import type { RoleType, TierType } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: RoleType | RoleType[];
  requiredTiers?: TierType | TierType[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles,
  requiredTiers,
  fallback,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const { hasRole, hasTier } = useAuthUtils();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
      return;
    }

    if (requiredRoles && !hasRole(requiredRoles)) {
      router.push('/dashboard');
      return;
    }

    if (requiredTiers && !hasTier(requiredTiers)) {
      router.push('/dashboard');
      return;
    }
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    requireAuth,
    requiredRoles,
    requiredTiers,
    hasRole,
    hasTier,
    router,
    redirectTo,
  ]);

  // Show loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check tier requirements
  if (requiredTiers && !hasTier(requiredTiers)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upgrade Required
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This feature requires a higher tier subscription.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;