"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useToast } from '@/components/ui/Toaster';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized, error } = useAuthStore();
  const toast = useToast();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || isInitialized) return;
    
    initRef.current = true;
    initialize();
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (error) {
      toast.error('Authentication Error', {
        description: error,
      });
    }
  }, [error, toast]);

  return <>{children}</>;
}

export default AuthProvider;