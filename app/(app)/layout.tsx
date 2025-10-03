'use client';

import { type ReactNode, useEffect } from 'react';
import localFont from 'next/font/local';
import { ThemeProvider } from 'next-themes';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Toaster } from '@/components/ui/sonner';
import { NavbarWrapper } from '@/components/navbar/navbar';

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export default function AppLayout({ children }: { children: ReactNode }) {


  return (
    <ThemeProvider attribute="class">
      <SidebarProvider>
        <AppSidebar />
        <main className={`${geistSans.variable} ${geistMono.variable} w-full bg-background text-foreground antialiased overflow-x-hidden`}>
          <NavbarWrapper />
          {children}
        </main>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}
