"use client";

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { useAuth, useAuthUtils } from '@/lib/store/auth';

export function AuthDebug() {
  const auth = useAuth();
  const utils = useAuthUtils();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 opacity-90 max-w-sm">
      <CardHeader>
        <h3 className="text-sm font-semibold">Auth Debug</h3>
      </CardHeader>
      <CardBody className="pt-0 space-y-2">
        <div className="flex flex-wrap gap-1">
          <Chip 
            size="sm" 
            color={auth.isAuthenticated ? "success" : "danger"}
            variant="flat"
          >
            {auth.isAuthenticated ? "Authenticated" : "Not Auth"}
          </Chip>
          <Chip 
            size="sm" 
            color={auth.isInitialized ? "success" : "warning"}
            variant="flat"
          >
            {auth.isInitialized ? "Initialized" : "Loading"}
          </Chip>
          {auth.isLoading && (
            <Chip size="sm" color="warning" variant="flat">
              Loading
            </Chip>
          )}
          {auth.error && (
            <Chip size="sm" color="danger" variant="flat">
              Error
            </Chip>
          )}
        </div>
        
        <div className="text-xs space-y-1">
          <div><strong>ID:</strong> {auth.user?.id?.slice(0, 8) || 'None'}...</div>
          <div><strong>Email:</strong> {auth.user?.email || 'None'}</div>
          <div><strong>Name:</strong> {auth.profile?.full_name || 'None'}</div>
          <div><strong>Role:</strong> {auth.profile?.role || 'None'}</div>
          <div><strong>Tier:</strong> {auth.profile?.tier || 'None'}</div>
        </div>

        <div className="text-xs">
          <div>Owner: {utils.isOwner() ? 'Yes' : 'No'}</div>
          <div>Admin: {utils.isAdmin() ? 'Yes' : 'No'}</div>
          <div>Member: {utils.isMember() ? 'Yes' : 'No'}</div>
        </div>

        {auth.error && (
          <div className="text-xs text-red-500 mt-2">
            <strong>Error:</strong> {auth.error}
          </div>
        )}
      </CardBody>
    </Card>
  );
}