import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFineTrack } from '@/context/FineTrackContext';
import { SupabaseBanner } from '@/components/common/SupabaseBanner';
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
import { ShieldCheck, Heart, Clock, Github, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      <div>
        {/* Top Info Banner */}
        <SupabaseBanner />

        {/* Public Top Navbar */}
        <PublicNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onNavigateToAdmin={handleAdminAccess}
        />

        {/* Main Public Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          {/* Public Overview Stats is always visible on top for high-level insight */}
          <PublicOverview onSelectPerson={(person) => setSelectedPersonForHistory(person)} />

          {/* Active Public Tab View */}
          <div className="pt-2">
            {activeTab === 'daily' && (
              <DailyLateTracker onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
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

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            <span className="font-bold text-slate-800">FineTrack</span>
            <span>—</span>
            <span>Live Late Tracking & Fine Management System</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Backend: <strong className="text-slate-800">Supabase PostgreSQL</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              Fixed rate: <strong className="text-rose-600">₹100 / Late Entry</strong>
            </span>
            <span>•</span>
            <button
              onClick={handleAdminAccess}
              className="text-slate-700 hover:text-slate-900 font-semibold underline underline-offset-2"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
