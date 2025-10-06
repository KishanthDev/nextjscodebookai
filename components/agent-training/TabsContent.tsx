import WebsitesTab from './websites/page';
import PdfTrainTab from './pdf/page';
import QATab from './qa/page';
import ArticlesTab from './articles/page';
import FlowsTab from './flows/page';
import StatsTab from './training-stats/page';

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
