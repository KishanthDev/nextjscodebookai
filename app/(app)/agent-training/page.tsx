'use client';

import { useSearchParams } from 'next/navigation';
import TabsContent from '@/components/agent-training/TabsContent';

export default function AIAgentPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'websites';

  return (
    <div>
      <TabsContent tab={tab} />
    </div>
  );
}
