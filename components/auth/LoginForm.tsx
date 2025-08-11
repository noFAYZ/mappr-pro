"use client";

import { useState } from 'react';
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
} from '@heroui/react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useSignIn } from '@/lib/hooks/auth/useAuth';
import { loginSchema, type LoginForm } from '@/types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  showHeader?: boolean;
}

export function LoginForm({ onSuccess, showHeader = true }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const signInMutation = useSignIn();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await signInMutation.mutateAsync(data);
      onSuccess?.();
      reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isLoading = signInMutation.isPending;

  return (
    <Card className="w-full max-w-md mx-auto">
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
        </CardHeader>
      )}
      
      <CardBody className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            variant="bordered"
          />

          {/* Password Field */}
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
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
            variant="bordered"
          />

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <Checkbox
              {...register('rememberMe')}
              size="sm"
              isDisabled={isLoading}
            >
              Remember me
            </Checkbox>
            
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant='faded'
      
            size="lg"
            className="w-full"
            isLoading={isLoading}
           
            endContent={!isLoading && <ArrowRight className="w-4 h-4" />}
          >
            Sign in
          </Button>
        </form>

        <Divider />

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

export default LoginForm;