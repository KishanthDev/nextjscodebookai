'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStatus } from "@/stores/useUserStatus";
/* import { useAIMessageHandler } from "@/stores/aiMessageHandler";
import Lottie from 'lottie-react';
import dotNotificationAnim from "../../../data/icon.json"
import { AIIcon } from "@/components/icons/AIIcon";  // adjust path as needed */


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
  MessageCircle,
  Bot,
  Settings2,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  Send,
  BadgeDollarSign,
  ChartGanttIcon,
} from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { acceptChats } = useUserStatus();
  /*   const { newMsgCount, resetNewMsgCount } = useAIMessageHandler();
   */
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
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/ai-agent', icon: MessageCircle, label: 'Agent Training' },

    /*    { href: '/ai-assistants', icon: AIIcon, label: 'AI Assistants' },
       { href: '/ai-assistants-users', icon: AIIcon, label: 'AI Assistant Users' }, */
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
            {links.map(({ href, icon: Icon, label }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  data-active={pathname === href}
                  /*   onClick={() => {
                      if (href === "/chats") resetNewMsgCount();
                    }} */
                  className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-indigo-500 data-[active=true]:to-purple-600 data-[active=true]:text-white data-[active=true]:shadow-lg"
                >
                  <Link href={href} className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {/* Always show Lucide chat icon */}
                      {href === "/chats" ? (
                        <MessageCircle className="mr-2 w-[18px] h-[18px]" strokeWidth={1.5} />
                      ) : href === "/ai-assistants" || href === "/ai-assistants-users" ? (
                        <Icon
                          className="mr-2 w-[18px] h-[18px]"
                        />
                      ) : (
                        <Icon className="mr-2 w-[18px] h-[18px]" strokeWidth={1.5} />
                      )}

                      <span className="truncate">{label}</span>
                    </div>

                    {/* Dot badge replaced by Lottie */}

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
