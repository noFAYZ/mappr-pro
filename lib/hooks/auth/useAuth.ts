"use client";

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/services/auth.service';
import { useAuthStore } from '@/lib/store/auth';
import { useToast } from '@/components/ui/Toaster';
import type {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  UpdateProfileForm,
  ChangePasswordForm,
} from '@/types/auth';

// Sign in hook
export const useSignIn = () => {
  const router = useRouter();
  const toast = useToast();
  const { setUser, setProfile, setOrganization, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginForm) => AuthService.signIn(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: async (result, variables) => {
      try {
        if (result.user) {
          const { profile, organization } = await AuthService.getCurrentUser();
          setUser(result.user as any);
          setProfile(profile);
          setOrganization(organization);
          
          toast.success('Welcome back!', {
            description: 'You have been successfully signed in.',
          });

          // Redirect to dashboard or intended page
          const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
          router.push(redirectTo);
        }
      } catch (error: any) {
        console.error('Post-signin error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.message);
      
      toast.error('Sign in failed', {
        description: error.message || 'Please check your credentials and try again.',
      });
    },
  });
};

// Sign up hook
export const useSignUp = () => {
  const router = useRouter();
  const toast = useToast();
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterForm) => AuthService.signUp(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false);
      
      toast.success('Account created!', {
        description: 'Please check your email to verify your account.',
      });

      router.push('/auth/verify-email');
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.message);
      
      toast.error('Registration failed', {
        description: error.message || 'Please try again with different details.',
      });
    },
  });
};

// Sign out hook
export const useSignOut = () => {
  const router = useRouter();
  const toast = useToast();
  const { clearAuth, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: () => AuthService.signOut(),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      clearAuth();
      
      toast.success('Signed out', {
        description: 'You have been successfully signed out.',
      });

      router.push('/auth/login');
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.message);
      
      toast.error('Sign out failed', {
        description: error.message || 'Please try again.',
      });
    },
  });
};

// Forgot password hook
export const useForgotPassword = () => {
  const toast = useToast();
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: (data: ForgotPasswordForm) => AuthService.sendPasswordReset(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false);
      
      toast.success('Reset email sent', {
        description: 'Please check your email for password reset instructions.',
      });
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.message);
      
      toast.error('Reset failed', {
        description: error.message || 'Please try again.',
      });
    },
  });
};

// Reset password hook
export const useResetPassword = () => {
  const router = useRouter();
  const toast = useToast();
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: (data: ResetPasswordForm) => AuthService.resetPassword(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false);
      
      toast.success('Password updated', {
        description: 'Your password has been successfully updated.',
      });

      router.push('/auth/login');
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.message);
      
      toast.error('Password reset failed', {
        description: error.message || 'Please try again.',
      });
    },
  });
};

// Update profile hook
export const useUpdateProfile = () => {
  const toast = useToast();
  const { setProfile, setLoading, setError, user } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileForm) => {
      if (!user) throw new Error('No user found');
      return AuthService.updateProfile(user.id, data);
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (updatedProfile) => {
      setProfile(updatedProfile);
      setLoading(false);
      
      toast.success('Profile updated', {
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.message);
      
      toast.error('Update failed', {
        description: error.message || 'Failed to update profile.',
      });
    },
  });
};

// Change password hook
export const useChangePassword = () => {
  const toast = useToast();
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: (data: ChangePasswordForm) => AuthService.changePassword(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false);
      
      toast.success('Password changed', {
        description: 'Your password has been successfully updated.',
      });
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.message);
      
      toast.error('Password change failed', {
        description: error.message || 'Failed to change password.',
      });
    },
  });
};