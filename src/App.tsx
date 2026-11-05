import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFineTrack } from '@/context/FineTrackContext';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicOverview } from '@/components/public/PublicOverview';
import { DailyLateTracker } from '@/components/public/DailyLateTracker';
import { IndividualSummaryTable } from '@/components/public/IndividualSummaryTable';
import { AllRecordsExplorer } from '@/components/public/AllRecordsExplorer';
import { AnalyticsCharts } from '@/components/public/AnalyticsCharts';
import { PersonHistoryModal } from '@/components/public/PersonHistoryModal';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminLoginModal } from '@/components/auth/AdminLoginModal';
import { PersonSummary } from '@/types/database';
import { Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const { isAdmin } = useAuth();
  const { loading: dataLoading } = useFineTrack();

  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [activeTab, setActiveTab] = useState<'daily' | 'summary' | 'all' | 'analytics'>('daily');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPersonForHistory, setSelectedPersonForHistory] = useState<PersonSummary | null>(null);

  const handleAdminAccess = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setCurrentView('admin');
  };

  if (currentView === 'admin' && isAdmin) {
    return <AdminLayout onBackToPublic={() => setCurrentView('public')} />;
  }

  return (
    <div className="min-h-screen bg-[#020303] text-[#d3dbd5] flex flex-col justify-between selection:bg-[#38ff8e] selection:text-[#020303] font-mono">
      <div>
        {/* Public Top Navbar */}
        <PublicNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onNavigateToAdmin={handleAdminAccess}
        />

        {/* Main Content with Green Signal Rail */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
          <div className="cyber-rail pl-4 sm:pl-6 space-y-6">
            {/* 1. Public Overview & Metric Cards */}
            <PublicOverview onSelectPerson={(person) => setSelectedPersonForHistory(person)} />

            {/* 2. Primary Data Views */}
            {activeTab === 'daily' && (
              <div className="space-y-6">
                <DailyLateTracker onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
                <div className="pt-2">
                  <IndividualSummaryTable onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <IndividualSummaryTable onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
            )}

            {activeTab === 'all' && (
              <AllRecordsExplorer onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
            )}

            {activeTab === 'analytics' && <AnalyticsCharts />}
          </div>
        </main>
      </div>

      {/* Global Person History Modal */}
      <PersonHistoryModal
        isOpen={Boolean(selectedPersonForHistory)}
        person={selectedPersonForHistory}
        onClose={() => setSelectedPersonForHistory(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Compact Clean Directory Footer */}
      <footer className="mt-12 bg-[#090e0b] border-t border-[#304c3b] py-5 text-xs text-[#c2cbc5] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#38ff8e]" />
            <span className="font-bold text-[#f8fffa] uppercase">FineTrack</span>
            <span className="text-[#304c3b]">|</span>
            <span className="text-[11px] text-[#c2cbc5]">Live Late Tracking & Fine Management</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>Database: <strong className="text-[#38ff8e]">Supabase PostgreSQL</strong></span>
            <span className="text-[#304c3b]">/</span>
            <span>Rate: <strong className="text-[#38ff8e]">₹100 / Late Entry</strong></span>
            <span className="text-[#304c3b]">/</span>
            <button
              onClick={handleAdminAccess}
              className="text-[#38ff8e] hover:underline uppercase font-bold"
            >
              [Admin Login]
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
