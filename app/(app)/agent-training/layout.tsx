import { Suspense } from 'react';
import TabNavigation from '../../../components/agent-training/TabNavigation';

function TabNavigationFallback() {
  return (
    <div className="w-[150px] border-r p-2 bg-gray-50 dark:bg-zinc-900">
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="px-3 py-2 rounded-md bg-gray-200 dark:bg-zinc-800 animate-pulse h-8"
          />
        ))}
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar with Suspense boundary */}
      <Suspense fallback={<TabNavigationFallback />}>
        <TabNavigation />
      </Suspense>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
