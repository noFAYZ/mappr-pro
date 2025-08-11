"use client";

import { Card, CardBody, CardHeader } from '@heroui/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';

export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account information and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </CardHeader>
            <CardBody>
              <ProfileSettingsForm />
            </CardBody>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Security</h2>
            </CardHeader>
            <CardBody>
              <ChangePasswordForm />
            </CardBody>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}