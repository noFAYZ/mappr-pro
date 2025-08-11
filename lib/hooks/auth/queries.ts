import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/auth';
import type {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  UpdateProfileForm,
  ChangePasswordForm,
} from '@/types/auth';
import AuthService from '@/lib/services/auth.service';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: (userId: string) => [...authKeys.all, 'profile', userId] as const,
  organization: (orgId: string) => [...authKeys.all, 'organization', orgId] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// Auth user query
export const useAuthUser = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: AuthService.getCurrentUser,
    enabled: isAuthenticated ,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    initialData: user ? { user, profile: null, organization: null } : undefined,
  });
};

// Profile query
export const useProfile = (userId?: string) => {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: authKeys.profile(targetUserId || ''),
    queryFn: () => AuthService.getProfile(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Organization query
export const useOrganization = (orgId?: string) => {
  return useQuery({
    queryKey: authKeys.organization(orgId || ''),
    queryFn: () => AuthService.getOrganization(orgId!),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Session query
export const useSession = () => {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: AuthService.getSession,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

// Sign in mutation
export const useSignIn = () => {
  const queryClient = useQueryClient();
  const { setUser, setProfile, setOrganization } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginForm) => AuthService.signIn(data),
    onSuccess: async (result) => {
      if (result.user) {
        // Update auth store
        setUser(result.user as any);
        
        // Fetch and update profile data
        const { profile, organization } = await AuthService.getCurrentUser();
        setProfile(profile);
        setOrganization(organization);
        
        // Invalidate auth queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    },
    onError: (error) => {
      console.error('Sign in error:', error);
    },
  });
};

// Sign up mutation
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterForm) => AuthService.signUp(data),
    onSuccess: () => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Sign up error:', error);
    },
  });
};

// Sign out mutation
export const useSignOut = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => AuthService.signOut(),
    onSuccess: () => {
      // Clear auth store
      clearAuth();
      
      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Sign out error:', error);
    },
  });
};

// Password reset mutation
export const useSendPasswordReset = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordForm) => AuthService.sendPasswordReset(data),
    onError: (error) => {
      console.error('Password reset error:', error);
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResetPasswordForm) => AuthService.resetPassword(data),
    onSuccess: () => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordForm) => AuthService.changePassword(data),
    onError: (error) => {
      console.error('Change password error:', error);
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, setProfile } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileForm) => {
      if (!user) throw new Error('No user found');
      return AuthService.updateProfile(user.id, data);
    },
    onSuccess: (updatedProfile) => {
      // Update auth store
      setProfile(updatedProfile);
      
      // Invalidate related queries
      if (user) {
        queryClient.invalidateQueries({ queryKey: authKeys.profile(user.id) });
      }
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error('Update profile error:', error);
    },
  });
};

// Refresh session mutation
export const useRefreshSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.refreshSession(),
    onSuccess: () => {
      // Invalidate session query
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
    onError: (error) => {
      console.error('Refresh session error:', error);
    },
  });
};

// Custom hook for auth status with automatic retries
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  return {
    isAuthenticated,
   
    isLoading,
    isReady: !isLoading,
  };
};

// Custom hook for protected operations
export const useProtectedMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
    requireAuth?: boolean;
  }
) => {
  const { isAuthenticated } = useAuthStore();
  const { requireAuth = true } = options || {};

  return useMutation({
    mutationFn,
    onMutate: (variables) => {
      if (requireAuth && !isAuthenticated) {
        throw new Error('Authentication required');
      }
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

// Activity logs query
export const useActivityLogs = (userId?: string, limit = 10) => {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: [...authKeys.all, 'activity', targetUserId, limit],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await AuthService.supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};