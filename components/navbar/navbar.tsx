"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { DarkModeSwitch } from "./darkmodeswitch";
import FullScreenToggle from "./FullScreenToggle";
import { UserDropdown } from "./user-dropdown";

export const NavbarWrapper = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const baseBtnClass = "inline-flex h-9 w-10 items-center justify-center rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <header
      className={cn(
        "w-full py-2 shadow-lg border-b",
        isDark
          ? "border-gray-700 bg-black text-white"
          : "border-gray-300 bg-white text-black"
      )}
    >
      <div className="flex items-center justify-between px-4 max-w-full mx-auto">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <span className="font-bold text-primary">Chat App</span>
        </div>

        {/* Right Section (Mobile: Dropdown, Desktop: Inline) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile View (Dropdown) */}
          <div className="block md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={baseBtnClass}>
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <DarkModeSwitch /> Dark mode
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FullScreenToggle /> Full screen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserDropdown /> User Dropdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop View (Inline) */}
          <div className="hidden md:flex items-center gap-3">
            <div className={baseBtnClass}>
              <DarkModeSwitch />
            </div>
            <div className={baseBtnClass}>
              <FullScreenToggle />
            </div>
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};
