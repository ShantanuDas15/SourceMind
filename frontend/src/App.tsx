import { MainLayout } from './components/layout/MainLayout';
import { ChatContainer } from './components/chat/ChatContainer';
import { ChatInput } from './components/chat/ChatInput';
import { IngestPanel } from './components/ingestion/IngestPanel';
import { ToastContainer } from './components/ui/ToastContainer';

function App() {
  return (
    <MainLayout>
      <div className="flex flex-col h-full relative">
        <ChatContainer />
        <ChatInput />
        <IngestPanel />
      </div>
      <ToastContainer />
    </MainLayout>
  );
}

export default App;
