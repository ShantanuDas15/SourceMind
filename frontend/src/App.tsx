import { MainLayout } from './components/layout/MainLayout';
import { ChatContainer } from './components/chat/ChatContainer';
import { ChatInput } from './components/chat/ChatInput';
import { IngestPanel } from './components/ingestion/IngestPanel';
import { ToastContainer } from './components/ui/ToastContainer';
import { ConnectionStatus } from './components/common/ConnectionStatus';
import { DegradedBanner } from './components/common/DegradedBanner';

function App() {
  return (
    <MainLayout>
      <div className="flex flex-col h-full relative">
        <ConnectionStatus />
        <DegradedBanner retryIn={30} />
        <ChatContainer />
        <ChatInput />
        <IngestPanel />
      </div>
      <ToastContainer />
    </MainLayout>
  );
}

export default App;
