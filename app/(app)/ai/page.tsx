'use client';

import { useState } from 'react';
import clsx from 'clsx';
import SpellingCorrection from '@/components/ai/SpellingCorrection';
import AudioToText from '@/components/ai/AudioToText';
import MessageForm from '@/components/ai/MessageForm';
import SmartReplyForm from '@/components/ai/SmartReplyForm';
import HtmlToParagraphsForm from '@/components/ai/HtmlToParagraphsForm';
import UserExpressionsForm from '@/components/ai/UserExpressionsForm';
import PlaygroundMessageForm from '@/components/ai/PlaygroundMessageForm';
import TextFormatterForm from '@/components/ai/TextFormatterForm';


// Define all tabs in one place
const tabs = [
  {
    id: 'spellingcorrection',
    label: 'Spelling Correction',
    component: <SpellingCorrection />
  },
  {
    id: 'audio',
    label: 'Audio → Text',
    component: <AudioToText />
  },
  {
    id: 'message',
    label: 'Message',
    component: <MessageForm />
  },
  {
    id: 'smartreply',
    label: 'Smart Reply',
    component: <SmartReplyForm />
  },
  {
    id: 'htmltotext',
    label: 'HTML → Text',
    component: <HtmlToParagraphsForm />
  },
  {
    id: 'userexpression',
    label: 'User Expression',
    component: <UserExpressionsForm />
  },
  {
    id: 'playgroundmessage',
    label: 'Playground Message',
    component: <PlaygroundMessageForm/>
  },
  {
    id: 'textformatter',
    label: 'Text Formatter',
    component: <TextFormatterForm/>
  }
];

export default function OpenAIPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-[150px] border-r p-2 bg-gray-50 dark:bg-zinc-900">
        <nav className="flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'text-left px-3 py-2 rounded-md text-sm font-medium capitalize',
                {
                  'bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-white':
                    activeTab === tab.id,
                  'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800':
                    activeTab !== tab.id,
                }
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeComponent}
      </div>
    </div>
  );
}
