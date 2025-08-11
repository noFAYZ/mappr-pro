import type {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  UpdateProfileForm,
  ChangePasswordForm,
  AuthError,
  Profile,
  Organization,
} from '@/types/auth';
import supabase from '../supabase/client';

class AuthService {
  // Sign in
  static async signIn(data: LoginForm) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Always get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      return { user, session: authData.session };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sign up
  static async signUp(data: RegisterForm) {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) throw error;

      return { user: authData.user, session: authData.session };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get current user - Safe method that handles missing sessions
  static async getCurrentUser() {
    try {
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // If no session or session error (but not missing session), return null
      if (sessionError && sessionError.message !== 'Auth session missing!') {
        console.error('Session error:', sessionError);
        return { user: null, profile: null, organization: null };
      }
      
      // If no session, return null user
      if (!session) {
        return { user: null, profile: null, organization: null };
      }

      // If we have a session, get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // If error getting user, return null
      if (userError) {
        console.error('User error:', userError);
        return { user: null, profile: null, organization: null };
      }

      if (!user) {
        return { user: null, profile: null, organization: null };
      }

      const profile = await this.getProfile(user.id);
      let organization = null;

      if (profile?.organization_id) {
        organization = await this.getOrganization(profile.organization_id);
      }

      return { user, profile, organization };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null, profile: null, organization: null };
    }
  }

  // Check if user is authenticated - Safe method
  static async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  // Get profile
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  // Get organization
  static async getOrganization(orgId: string): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  }

  // Create profile
  static async createProfile(userId: string, profileData: { email: string; full_name: string }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: profileData.email,
          full_name: profileData.full_name,
          role: 'member',
          tier: 'free',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update profile
  static async updateProfile(userId: string, data: UpdateProfileForm) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          email: data.email,
          avatar_url: data.avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update auth user email if changed
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email !== data.email) {
        await supabase.auth.updateUser({ email: data.email });
      }

      return profile;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send password reset
  static async sendPasswordReset(data: ForgotPasswordForm) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reset password
  static async resetPassword(data: ResetPasswordForm) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Change password
  static async changePassword(data: ChangePasswordForm) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No authenticated user found');

      // Verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (verifyError) throw new Error('Current password is incorrect');

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Auth state listener with proper error handling
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          // For sign in, validate the user
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) {
            console.error('Failed to validate user on sign in:', error);
            callback(event, null);
            return;
          }
          
          const validatedSession = { ...session, user };
          callback(event, validatedSession);
        } else if (event === 'SIGNED_OUT') {
          callback(event, null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // For token refresh, use the session user (it's already validated)
          callback(event, session);
        } else if (event === 'USER_UPDATED' && session?.user) {
          callback(event, session);
        } else {
          callback(event, session);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        callback(event, null);
      }
    });
  }

  // Error handler
  private static handleError(error: any): AuthError {
    console.error('Auth error:', error);

    let message = 'An unexpected error occurred';
    let code = error?.code || 'unknown_error';
    let field: string | undefined;

    // Handle specific Supabase auth errors
    if (error?.message) {
      switch (error.message) {
        case 'Invalid login credentials':
          message = 'Invalid email or password';
          field = 'email';
          break;
        case 'Email not confirmed':
          message = 'Please verify your email address before signing in';
          field = 'email';
          break;
        case 'User already registered':
          message = 'An account with this email already exists';
          field = 'email';
          break;
        case 'Password should be at least 6 characters':
          message = 'Password must be at least 6 characters';
          field = 'password';
          break;
        case 'signup disabled':
          message = 'Registration is currently disabled';
          break;
        case 'Current password is incorrect':
          message = 'Current password is incorrect';
          field = 'currentPassword';
          break;
        case 'Auth session missing!':
          message = 'Please sign in to continue';
          break;
        default:
          message = error.message;
      }
    }

    return { message, code, field };
  }
}

export default AuthService;