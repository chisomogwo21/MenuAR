import React from 'react';
import BottomNav from './BottomNav';
import { useAppContext } from '../../context/AppContext';
import AIAssistant from './AIAssistant';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { isAIAssistantOpen } = useAppContext();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-sm mx-auto min-h-screen bg-white relative shadow-xl">
        <main className="pb-20">
          {children}
        </main>
        
        <BottomNav />

        {/* AI Assistant Overlay Slot */}
        {isAIAssistantOpen && <AIAssistant />}
      </div>
    </div>
  );
};

export default CustomerLayout;
