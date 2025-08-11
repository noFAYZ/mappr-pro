"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@heroui/react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useChangePassword } from '@/lib/hooks/auth/queries';
import { changePasswordSchema, type ChangePasswordForm } from '@/types/auth';
import { useToast } from '@/components/ui/Toaster';

export function ChangePasswordForm() {
  const  toast  = useToast();
  const changePasswordMutation = useChangePassword();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      
      toast.success("Password changed", {
        description: "Your password has been successfully updated.",
      });

      reset();
    } catch (error: any) {
      let errorMessage = "Failed to change password. Please try again.";
      
      if (error.message.includes('Current password is incorrect')) {
        errorMessage = "Current password is incorrect. Please try again.";
      } else if (error.message.includes('Password')) {
        errorMessage = error.message;
      }

      toast.error("Password change failed", {
        description: errorMessage,
      });
    }
  };

  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const isLoading = isSubmitting || changePasswordMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Current Password */}
      <Input
        {...register('currentPassword')}
        type={showPasswords.current ? 'text' : 'password'}
        label="Current Password"
        placeholder="Enter your current password"
        startContent={<Lock className="w-4 h-4 text-gray-400" />}
        endContent={
          <button
            type="button"
            onClick={() => toggleShowPassword('current')}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showPasswords.current ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
        isInvalid={!!errors.currentPassword}
        errorMessage={errors.currentPassword?.message}
        isDisabled={isLoading}
      />

      {/* New Password */}
      <Input
        {...register('newPassword')}
        type={showPasswords.new ? 'text' : 'password'}
        label="New Password"
        placeholder="Enter your new password"
        startContent={<Lock className="w-4 h-4 text-gray-400" />}
        endContent={
          <button
            type="button"
            onClick={() => toggleShowPassword('new')}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showPasswords.new ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
        isInvalid={!!errors.newPassword}
        errorMessage={errors.newPassword?.message}
        isDisabled={isLoading}
      />

      {/* Confirm New Password */}
      <Input
        {...register('confirmNewPassword')}
        type={showPasswords.confirm ? 'text' : 'password'}
        label="Confirm New Password"
        placeholder="Confirm your new password"
        startContent={<Lock className="w-4 h-4 text-gray-400" />}
        endContent={
          <button
            type="button"
            onClick={() => toggleShowPassword('confirm')}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showPasswords.confirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
        isInvalid={!!errors.confirmNewPassword}
        errorMessage={errors.confirmNewPassword?.message}
        isDisabled={isLoading}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? 'Changing password...' : 'Change Password'}
      </Button>
    </form>
  );
}