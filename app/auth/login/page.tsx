import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { LogoLoader } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Sign In | Mappr Pro',
  description: 'Sign in to your Mappr Pro account to access your portfolio dashboard.',
};

function LoginPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LogoLoader className='w-12 h-12' />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}