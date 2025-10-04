'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStatus } from "@/stores/useUserStatus";
import { Icon as CustomIcon } from './Icon'; // renamed to avoid confusion

import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

import {
  LayoutDashboard,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  MessageCircle,
  Bot,
} from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { acceptChats } = useUserStatus();

  const user = {
    name: 'zoey',
    email: 'zoey@example.com',
    avatar: '/avatars/shadcn.jpg',
  };

  const teams = [
    { name: 'Acme Inc', logo: GalleryVerticalEnd, plan: 'Enterprise' },
    { name: 'Acme Corp.', logo: AudioWaveform, plan: 'Startup' },
    { name: 'Evil Corp.', logo: Command, plan: 'Free' },
  ];

  const links = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', type: 'lucide' },
    { href: '/manage-assistant', icon: MessageCircle, label: 'Manage Assistant', type: 'lucide' },
    { href: '/ai', icon: Bot, label: 'AI', type: 'lucide' },
    { href: '/ai-agent', icon: "/icons/chat-bot.png", label: 'Agent Training', type: 'custom' },
    { href: '/agent-bots', icon: "/icons/bot.png", label: 'Agent Bots', type: 'custom' },
    { href: '/openai-assistant-chat', icon: "/icons/chat-gpt.png", label: 'OpenAI Assistant Chat', type: 'custom' },
    { href: '/ai-assistants', icon: "/icons/generative.png", label: 'AI Assistants', type: 'custom' },
    { href: '/ai-assistants-users', icon: "/icons/text.png", label: 'AI Assistant Users', type: 'custom' },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
        <SidebarGroup className="py-0 group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {links.map(({ href, icon, label, type }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  data-active={pathname === href}
                  className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-indigo-500 data-[active=true]:to-purple-600 data-[active=true]:text-white data-[active=true]:shadow-lg"
                >
                  <Link href={href} className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {href === "/chats" ? (
                        <MessageCircle className="mr-2 w-[18px] h-[18px]" strokeWidth={1.5} />
                      ) : type === "custom" ? (
                        <CustomIcon
                          src={icon as string}
                          size={18}
                          className="mr-2"
                          active={pathname === href}
                        />
                      ) : (
                        React.createElement(icon as React.ComponentType<{ className?: string; strokeWidth?: number }>, {
                          className: "mr-2 w-[18px] h-[18px]",
                          strokeWidth: 1.5,
                        })
                      )}
                      <span className="truncate">{label}</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} isOnline={acceptChats} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
