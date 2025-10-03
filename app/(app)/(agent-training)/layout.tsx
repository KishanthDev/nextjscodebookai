"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { id: "websites", label: "Websites", href: "/ai-agent" },
  { id: "pdftrain", label: "PDF Train", href: "/pdf" },
  { id: "qa", label: "Q&A", href: "/qa" },
  { id: "articles", label: "Articles", href: "/articles" },
  { id: "flows", label: "Flows", href: "/flows" },
  { id: "stats", label: "Stats", href: "/training-stats" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-[150px] border-r p-2 bg-gray-50 dark:bg-zinc-900">
        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={clsx(
                  "text-left px-3 py-2 rounded-md text-sm font-medium capitalize",
                  isActive
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
