'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  AlertTriangle,
  Bell,
  Building,
  ChevronsUpDown,
  Download,
  Keyboard,
  LifeBuoy,
  LogOut,
  MessageCircle,
  Moon,
  Sliders,
  User2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUserStatus } from '@/stores/useUserStatus';

type NavUserProps = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  isOnline: boolean;
};

const StatusIndicator = ({
  isOnline,
  borderClass,
}: {
  isOnline: boolean;
  borderClass: string;
}) => (
  <span
    className={cn(
      'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2',
      borderClass,
      isOnline ? 'bg-green-500' : 'bg-red-500',
    )}
  />
);

export function NavUser({ user, isOnline }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { acceptChats, toggleAcceptChats } = useUserStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const borderClass = mounted && theme === 'dark' ? 'border-zinc-900' : 'border-white';
  const iconBgClass = mounted && theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';

  const handleAcceptChatsToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleAcceptChats();
  };

  const handleDarkModeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="relative">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-200">
                <User2 className="h-6 w-6" />
              </div>
              <span
                className={cn(
                  'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white',
                  isOnline ? 'bg-green-500' : 'bg-red-500',
                )}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative">
                <div className={cn('flex items-center justify-center h-8 w-8 rounded-lg', iconBgClass)}>
                  <User2 className={cn('h-6 w-6', mounted && theme === 'dark' ? 'text-white' : 'text-black')} />
                </div>
                <StatusIndicator isOnline={isOnline} borderClass={borderClass} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="relative">
                <div className={cn('flex items-center justify-center h-8 w-8 rounded-lg', iconBgClass)}>
                  <User2 className={cn('h-6 w-6', mounted && theme === 'dark' ? 'text-white' : 'text-black')} />
                </div>
                <StatusIndicator isOnline={isOnline} borderClass={borderClass} />
              </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Accept chats
                </div>
                <label
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={acceptChats}
                    onChange={() => {}}
                    onClick={handleAcceptChatsToggle}
                    aria-label="Accept chats"
                    data-testid="accept-chats-toggle"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors duration-500 ease-in-out ${
                      acceptChats ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition duration-500 ease-in-out mt-1 ml-1 ${
                        acceptChats ? 'translate-x-4 scale-110' : 'translate-x-0 scale-100'
                      }`}
                    ></div>
                  </div>
                </label>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark mode
                </div>
                <label
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={theme === 'dark'}
                    onChange={() => {}}
                    onClick={handleDarkModeToggle}
                    aria-label="Dark mode"
                    data-testid="dark-mode-toggle"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors duration-500 ease-in-out ${
                      theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition duration-500 ease-in-out mt-1 ml-1 ${
                        theme === 'dark' ? 'translate-x-4 scale-110' : 'translate-x-0 scale-100'
                      }`}
                    ></div>
                  </div>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Notification Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" />
                Help center
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Report an issue
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Keyboard shortcut
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Apps
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <Link href="/auth">Log out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}