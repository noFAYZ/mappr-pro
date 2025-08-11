"use client";

import { useState } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Button,
} from '@heroui/react';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  CreditCard,
  ChevronDown 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthUtils } from '@/lib/store/auth';
import { useSignOut } from '@/lib/hooks/auth/queries';
import { useToast } from '@/components/ui/Toaster';

export function UserMenu() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { isAdmin } = useAuthUtils();
  const toast  = useToast();
  const signOutMutation = useSignOut();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
      
      toast.success("Signed out", {
        description: "You have been successfully signed out.",
      });

      router.push('/auth/login');
    } catch (error: any) {
      toast.error("Sign out failed", {
        description: error.message || "Failed to sign out. Please try again.",
      });
    }
  };

  const menuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: User,
      href: '/settings/profile',
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings',
    },
    {
      key: 'billing',
      label: 'Billing',
      icon: CreditCard,
      href: '/settings/billing',
    },
    ...(isAdmin() ? [{
      key: 'admin',
      label: 'Admin Panel',
      icon: Shield,
      href: '/admin',
    }] : []),

    {
      key: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      href: '',
      action: handleSignOut,
    },
  ];

  return (
    <Dropdown 
      isOpen={isOpen} 
      onOpenChange={setIsOpen}
      placement="bottom-end"
    >
      <DropdownTrigger>
 
          <Avatar
            src={profile?.avatar_url || ''}
            alt={profile?.full_name || 'User'}
            size="sm"
            className='w-10 h-10 cursor-pointer'
            fallback={<User className="w-4 h-4" />}
          
          />
       
    
      </DropdownTrigger>

      <DropdownMenu
        aria-label="User menu"
        className="w-48"
        
        onAction={(key) => {
          const item = menuItems.find(item => item.key === key);
          if (item?.action) {
            item.action();
          } else if (item?.href) {
            router.push(item.href);
          }
          setIsOpen(false);
        }}
      >
        {/* User Info Header */}
        <DropdownItem
          key="user-info"
          className="opacity-100 cursor-default"
          textValue="User info"
          variant='flat'
        >
          <div className="flex items-center gap-3 py-1">
    
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-white">
                {profile?.full_name || 'User'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                {profile?.tier} Plan
              </span>
            </div>
          </div>
        </DropdownItem>

        {/* Menu Items */}
        {menuItems.map((item) => {
          if (item.key === 'divider') {
            return <DropdownItem key="divider" className="border-t" />;
          }

          const Icon = item.icon;
          return (
            <DropdownItem
              key={item.key}
              startContent={Icon && <Icon className="w-4 h-4" />}
              className={item.key === 'logout' ? 'text-danger bg-danger-50' : ''}
            variant='faded'
            >
              {item.label}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}