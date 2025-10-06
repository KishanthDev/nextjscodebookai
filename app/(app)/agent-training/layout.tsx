'use client';

import clsx from 'clsx';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const tabs = [
  { id: 'websites', label: 'Websites' },
  { id: 'pdftrain', label: 'PDF Train' },
  { id: 'qa', label: 'Q&A' },
  { id: 'articles', label: 'Articles' },
  { id: 'flows', label: 'Flows' },
  { id: 'stats', label: 'Stats' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'websites';

  const handleTabClick = (tabId: string) => {
    router.push(`${pathname}?tab=${tabId}`);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-[150px] border-r p-2 bg-gray-50 dark:bg-zinc-900">
        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={clsx(
                  'text-left px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
