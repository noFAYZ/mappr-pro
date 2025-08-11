"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Progress,
} from '@heroui/react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { useSignUp } from '@/lib/hooks/auth/queries';
import { registerSchema, type RegisterForm } from '@/types/auth';
import { useToast } from '@/components/ui/Toaster';

interface RegisterFormProps {
  onSuccess?: () => void;
  showHeader?: boolean;
}

// Password strength checker
const getPasswordStrength = (password: string) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  strength = Object.values(checks).filter(Boolean).length;
  
  return {
    score: strength,
    checks,
    percentage: (strength / 5) * 100,
    label: strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong',
    color: strength < 2 ? 'danger' : strength < 4 ? 'warning' : 'success',
  };
};

export function RegisterForm({ onSuccess, showHeader = true }: RegisterFormProps) {
  const router = useRouter();
  const  toast  = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const signUpMutation = useSignUp();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      acceptTerms: false,
    },
  });

  const watchedPassword = watch('password');
  const passwordStrength = watchedPassword ? getPasswordStrength(watchedPassword) : null;

  const onSubmit = async (data: RegisterForm) => {
    try {
      await signUpMutation.mutateAsync(data);
      
      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account.",
      });

      router.push('/auth/verify-email');
      onSuccess?.();
      reset();
    } catch (error: any) {
      let errorMessage = 'Please try again with different details.';
      
      // Enhanced error handling
      if (error?.message) {
        if (error.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Try signing in instead.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Password does not meet requirements. Please choose a stronger password.';
        } else if (error.message.includes('Email')) {
          errorMessage = 'Please enter a valid email address.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error("Registration failed", {
        description: errorMessage,
      });
    }
  };

  const isLoading = isSubmitting || signUpMutation.isPending;

  return (
    <Card className="w-full max-w-md mx-auto">
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join us to get started with your portfolio
            </p>
          </div>
        </CardHeader>
      )}
      
      <CardBody className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name Field */}
          <Input
            {...register('fullName')}
            type="text"
            label="Full name"
            placeholder="Enter your full name"
            startContent={<User className="w-4 h-4 text-gray-400" />}
            isInvalid={!!errors.fullName}
            errorMessage={errors.fullName?.message}
            isDisabled={isLoading}
            classNames={{
              input: "text-base",
              inputWrapper: "h-12",
            }}
          />

          {/* Email Field */}
          <Input
            {...register('email')}
            type="email"
            label="Email address"
            placeholder="Enter your email"
            startContent={<Mail className="w-4 h-4 text-gray-400" />}
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
            isDisabled={isLoading}
            classNames={{
              input: "text-base",
              inputWrapper: "h-12",
            }}
          />

          {/* Password Field */}
          <div className="space-y-2">
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Create a password"
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              isDisabled={isLoading}
              classNames={{
                input: "text-base",
                inputWrapper: "h-12",
              }}
            />
            
            {/* Password Strength Indicator */}
            {passwordStrength && watchedPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password strength</span>
                  <span className={`font-medium ${
                    passwordStrength.color === 'danger' ? 'text-red-500' :
                    passwordStrength.color === 'warning' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <Progress
                  value={passwordStrength.percentage}
                  color={passwordStrength.color as any}
                  size="sm"
                  className="h-1"
                />
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {passwordStrength.checks.length ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-300" />
                    )}
                    8+ characters
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordStrength.checks.uppercase ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-300" />
                    )}
                    Uppercase
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordStrength.checks.lowercase ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-300" />
                    )}
                    Lowercase
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordStrength.checks.number ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-300" />
                    )}
                    Number
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <Input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm password"
            placeholder="Confirm your password"
            startContent={<Lock className="w-4 h-4 text-gray-400" />}
            endContent={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
            isDisabled={isLoading}
            classNames={{
              input: "text-base",
              inputWrapper: "h-12",
            }}
          />

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <Checkbox
              {...register('acceptTerms')}
              size="sm"
              isInvalid={!!errors.acceptTerms}
              isDisabled={isLoading}
            >
              <span className="text-sm">
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-primary hover:text-primary/80 underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link
                  href="/privacy"
                  className="text-primary hover:text-primary/80 underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </span>
            </Checkbox>
            {errors.acceptTerms && (
              <p className="text-xs text-red-500 mt-1">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            endContent={!isLoading && <ArrowRight className="w-4 h-4" />}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <Divider />

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  );
}