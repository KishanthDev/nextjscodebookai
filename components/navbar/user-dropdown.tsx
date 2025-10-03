"use client";

import React, { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { User2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStatus } from "@/stores/useUserStatus";

const Divider = () => (
    <div className="my-2 h-px bg-gray-200 dark:bg-zinc-700" />
);

// Only Online and Offline now
const statusOptions = [
    { label: "Online", color: "bg-green-500", value: true },
    { label: "Offline", color: "bg-red-500", value: false },
];

export const UserDropdown = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    if (!resolvedTheme) return null;

    const router = useRouter();
    const { acceptChats, toggleAcceptChats } = useUserStatus();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/auth");
    };

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-haspopup="true"
                    aria-label="User menu"
                    className={cn(
                        "relative cursor-pointer rounded-full bg-transparent p-0",
                        isOpen ? "ring-2 ring-primary" : "focus:outline-none focus:ring-2 focus:ring-primary"
                    )}
                >
                    <User2 className={cn("h-8 w-8", isDark ? "text-white" : "text-black")} />
                    <span
                        className={cn(
                            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2",
                            isDark ? "border-zinc-900" : "border-white",
                            acceptChats ? "bg-green-500" : "bg-red-500"
                        )}
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className={cn(
                    "w-64 rounded-lg p-2 shadow-xl",
                    isDark ? "bg-zinc-900 text-white" : "bg-white text-black"
                )}
                align="end"
            >
                <DropdownMenuItem className="h-16 focus:bg-transparent">
                    <div className="inline-flex items-center gap-2">
                        <span
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full",
                                isDark ? "bg-gray-700" : "bg-gray-200"
                            )}
                        >
                            <User2 className={cn("h-6 w-6", isDark ? "text-white" : "text-black")} />
                        </span>

                        <div className="inline-flex flex-col items-start">
                            <span className={cn("font-bold text-base", isDark ? "text-white" : "text-black")}>
                                Signed in as
                            </span>
                            <span
                                className={cn(
                                    "font-medium text-sm",
                                    isDark ? "text-gray-400" : "text-gray-500"
                                )}
                            >
                                zoey@example.com
                            </span>
                        </div>
                    </div>
                </DropdownMenuItem>

                <div className="px-1 py-1">
                    <Divider />
                </div>

                <DropdownMenuItem
                    className={cn(
                        "text-base",
                        isDark ? "text-white hover:bg-zinc-800" : "text-black hover:bg-gray-100"
                    )}
                >
                    My Profile
                </DropdownMenuItem>

                {/* Status submenu */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                        className={cn("text-base", isDark ? "text-white" : "text-black")}
                    >
                        Status
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                        className={cn(
                            "w-40 rounded-lg p-2 shadow-xl",
                            isDark ? "bg-zinc-900 text-white" : "bg-white text-black"
                        )}
                    >
                        {statusOptions.map(({ label, color, value }) => (
                            <DropdownMenuItem
                                key={label}
                                className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm",
                                    isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
                                )}
                                onClick={() => {
                                    if (acceptChats !== value) {
                                        toggleAcceptChats();
                                    }
                                }}
                            >
                                <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
                                {label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <div className="px-1 py-1">
                    <Divider />
                </div>

                <DropdownMenuItem
                    onClick={handleLogout}
                    className={cn(
                        "text-base font-medium",
                        isDark ? "text-red-400 hover:bg-zinc-800" : "text-red-500 hover:bg-gray-100"
                    )}
                >
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
