'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TabsContent from '@/components/agent-training/TabsContent';

export default function AIAgentPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'websites';

  return (
    <div>
      <Suspense fallback={<div className="text-center py-10">Loading tab...</div>}>
        <TabsContent tab={tab} />
      </Suspense>
    </div>
  );
}
