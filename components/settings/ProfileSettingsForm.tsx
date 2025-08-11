"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Avatar } from '@heroui/react';
import { User, Mail, Camera } from 'lucide-react';
import { useUpdateProfile } from '@/lib/hooks/auth/queries';
import { updateProfileSchema, type UpdateProfileForm } from '@/types/auth';
import { useToast } from '@/components/ui/Toaster';
import { useAuth } from '@/lib/store/auth';

export function ProfileSettingsForm() {
  const { user, profile } = useAuth();
  const  toast  = useToast();
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      email: profile?.email || user?.email || '',
      avatarUrl: profile?.avatar_url || '',
    },
  });

  const onSubmit = async (data: UpdateProfileForm) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      
      toast.success("Profile updated", {
        description: "Your profile information has been successfully updated.",
      });
    } catch (error: any) {
      toast.error("Update failed", {
        description: error.message || "Failed to update profile. Please try again.",
      });
    }
  };

  const isLoading = isSubmitting || updateProfileMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-4">
        <Avatar
          src={profile?.avatar_url || ''}
          alt={profile?.full_name || 'Profile'}
          className="w-20 h-20"
          fallback={<User className="w-8 h-8" />}
        />
        <div>
          <Button
            variant="bordered"
            size="sm"
            startContent={<Camera className="w-4 h-4" />}
            isDisabled={isLoading}
          >
            Change Photo
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, GIF or PNG. Max size 1MB.
          </p>
        </div>
      </div>

      {/* Full Name */}
      <Input
        {...register('fullName')}
        label="Full Name"
        placeholder="Enter your full name"
        startContent={<User className="w-4 h-4 text-gray-400" />}
        isInvalid={!!errors.fullName}
        errorMessage={errors.fullName?.message}
        isDisabled={isLoading}
      />

      {/* Email */}
      <Input
        {...register('email')}
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        startContent={<Mail className="w-4 h-4 text-gray-400" />}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
        isDisabled={isLoading}
      />

      {/* Avatar URL */}
      <Input
        {...register('avatarUrl')}
        label="Avatar URL (Optional)"
        placeholder="https://example.com/avatar.jpg"
        isInvalid={!!errors.avatarUrl}
        errorMessage={errors.avatarUrl?.message}
        isDisabled={isLoading}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        
        className="w-full"
      >
        {isLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </form>
  );
}