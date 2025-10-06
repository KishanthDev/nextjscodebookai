'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TabsContent from '@/components/agent-training/TabsContent';

function PageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'websites';

  return <TabsContent tab={tab} />;
}

export default function AIAgentPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading content...</div>}>
      <PageContent />
    </Suspense>
  );
}
