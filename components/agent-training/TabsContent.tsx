import WebsitesTab from './tabs/WebsitesTab';
import PdfTrainTab from './tabs/PdfTab';
import QATab from './tabs/QaTab';
import ArticlesTab from './tabs/ArticlesTab';
import FlowsTab from './tabs/FlowsTab';
import StatsTab from './tabs/StatsTab';

export default function TabsContent({ tab }: { tab: string }) {
    switch (tab) {
        case 'pdftrain':
            return <PdfTrainTab />;
        case 'qa':
            return <QATab />;
        case 'articles':
            return <ArticlesTab />;
        case 'flows':
            return <FlowsTab />;
        case 'stats':
            return <StatsTab />;
        default:
            return <WebsitesTab />;
    }
}
