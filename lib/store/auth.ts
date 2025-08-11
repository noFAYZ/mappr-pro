import { create } from 'zustand';
import AuthService from '@/lib/services/auth.service';
import type { AuthState, AuthUser, Profile, Organization } from '@/types/auth';

interface AuthActions {
  // Initialization
  initialize: () => Promise<void>;
  
  // State setters
  setUser: (user: AuthUser | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOrganization: (organization: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth actions
  clearAuth: () => void;
  refreshProfile: () => Promise<void>;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  profile: null,
  organization: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  error: null,

  // Initialize auth - Safe initialization
  initialize: async () => {
    const state = get();
    if (state.isInitialized) return;
    
    set({ isLoading: true, error: null });
    
    try {
      // Use the safe getCurrentUser method
      const { user, profile, organization } = await AuthService.getCurrentUser();
      
      set({
        user: user as AuthUser,
        profile,
        organization,
        isAuthenticated: !!user,
        isInitialized: true,
        isLoading: false,
        error: null,
      });

      // Set up auth listener with better error handling
      AuthService.onAuthStateChange(async (event, session) => {
        try {
          console.log('Auth event:', event);
          
          if (event === 'SIGNED_IN' && session?.user) {
            // Get fresh profile data
            const { profile, organization } = await AuthService.getCurrentUser();
            set({
              user: session.user as AuthUser,
              profile,
              organization,
              isAuthenticated: true,
              error: null,
            });
          } else if (event === 'SIGNED_OUT') {
            set({
              user: null,
              profile: null,
              organization: null,
              isAuthenticated: false,
              error: null,
            });
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            const currentState = get();
            // Only update if user ID changed
            if (currentState.user?.id !== session.user.id) {
              set({ user: session.user as AuthUser, error: null });
            }
          } else if (event === 'USER_UPDATED' && session?.user) {
            set({ user: session.user as AuthUser, error: null });
          }
        } catch (error: any) {
          console.error('Auth state change error:', error);
          set({ error: error.message || 'Auth state change failed' });
        }
      });
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      
      // Don't treat "Auth session missing" as a real error for initialization
      const isSessionMissing = error.message?.includes('Auth session missing');
      
      set({
        user: null,
        profile: null,
        organization: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
        error: isSessionMissing ? null : (error.message || 'Failed to initialize authentication'),
      });
    }
  },

  // Setters
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setOrganization: (organization) => set({ organization }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Clear auth
  clearAuth: () => set({
    user: null,
    profile: null,
    organization: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),

  // Refresh profile
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { profile, organization } = await AuthService.getCurrentUser();
      set({ profile, organization, error: null });
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      // Don't set error for profile refresh failures unless it's critical
      if (!error.message?.includes('Auth session missing')) {
        set({ error: error.message || 'Failed to refresh profile' });
      }
    }
  },
}));

// Stable selectors
export const useAuth = () => useAuthStore();
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useCurrentUser = () => useAuthStore(state => state.user);
export const useCurrentProfile = () => useAuthStore(state => state.profile);

// Auth utilities
export const useAuthUtils = () => {
  const profile = useAuthStore(state => state.profile);
  
  return {
    hasRole: (role: string | string[]) => {
      if (!profile?.role) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(profile.role);
    },
    hasTier: (tier: string | string[]) => {
      if (!profile?.tier) return false;
      const tiers = Array.isArray(tier) ? tier : [tier];
      return tiers.includes(profile.tier);
    },
    isOwner: () => profile?.role === 'owner',
    isAdmin: () => profile?.role === 'owner' || profile?.role === 'admin',
    isMember: () => ['owner', 'admin', 'member'].includes(profile?.role || ''),
  };
};