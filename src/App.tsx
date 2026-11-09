import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { Terminal, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPersonForHistory, setSelectedPersonForHistory] = useState<PersonSummary | null>(null);

  const handleAdminAccess = () => {
    if (isAdmin) {
      navigate('/admin/overview');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    navigate('/admin/overview');
  };

  // If on admin routes
  if (location.pathname.startsWith('/admin')) {
    if (isAdmin) {
      return <AdminLayout onBackToPublic={() => navigate('/daily')} />;
    } else {
      return (
        <div className="min-h-screen bg-[#020303] text-[#d3dbd5] flex flex-col justify-between font-mono selection:bg-[#38ff8e] selection:text-[#020303]">
          <PublicNavbar
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onNavigateToAdmin={() => setIsLoginModalOpen(true)}
          />

          <main className="max-w-md mx-auto my-auto p-6 bg-[#090e0b] border border-[#304c3b] text-center space-y-4">
            <h3 className="font-bold text-base text-[#f8fffa] uppercase">RESTRICTED_ACCESS // ADMIN_REQUIRED</h3>
            <p className="text-xs text-[#c2cbc5]">
              Administrative authorization is required to access telemetry management.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/daily')}
                className="px-3 py-1.5 text-xs font-bold uppercase border border-[#304c3b] text-[#c2cbc5] hover:text-[#f8fffa]"
              >
                PUBLIC_DASHBOARD
              </button>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold uppercase bg-[#38ff8e] text-[#020303] border border-[#38ff8e] clip-corner-diagonal"
              >
                ADMIN_LOGIN
              </button>
            </div>
          </main>

          <AdminLoginModal
            isOpen={isLoginModalOpen}
            onClose={() => {
              setIsLoginModalOpen(false);
              navigate('/daily');
            }}
            onSuccess={handleLoginSuccess}
          />

          <footer className="mt-12 bg-[#090e0b] border-t border-[#304c3b] py-5 text-xs text-[#c2cbc5] font-mono">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#38ff8e]" />
                <span className="font-bold text-[#f8fffa] uppercase">FineTrack</span>
                <span className="text-[#304c3b]">|</span>
                <span className="text-[11px] text-[#c2cbc5]">Live Late Tracking & Fine Management</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#c2cbc5]">
                <span>Made by <strong className="text-[#f8fffa] font-semibold">Varun</strong> with</span>
                <Heart className="w-3.5 h-3.5 text-[#ff65d8] fill-[#ff65d8] inline animate-pulse" />
              </div>
            </div>
          </footer>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#020303] text-[#d3dbd5] flex flex-col justify-between selection:bg-[#38ff8e] selection:text-[#020303] font-mono">
      <div>
        {/* Public Top Navbar */}
        <PublicNavbar
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onNavigateToAdmin={handleAdminAccess}
        />

        {/* Main Content with Green Signal Rail */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
          <div className="cyber-rail pl-4 sm:pl-6 space-y-6">
            {/* Public Overview & Metric Cards */}
            <PublicOverview onSelectPerson={(person) => setSelectedPersonForHistory(person)} />

            {/* URL Routed Views */}
            <Routes>
              <Route path="/" element={<Navigate to="/daily" replace />} />
              <Route
                path="/daily"
                element={
                  <div className="space-y-6">
                    <DailyLateTracker onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
                    <div className="pt-2">
                      <IndividualSummaryTable onSelectPerson={(person) => setSelectedPersonForHistory(person)} />
                    </div>
                  </div>
                }
              />
              <Route
                path="/summary"
                element={<IndividualSummaryTable onSelectPerson={(person) => setSelectedPersonForHistory(person)} />}
              />
              <Route
                path="/records"
                element={<AllRecordsExplorer onSelectPerson={(person) => setSelectedPersonForHistory(person)} />}
              />
              <Route path="/all" element={<Navigate to="/records" replace />} />
              <Route path="/late-records" element={<Navigate to="/records" replace />} />
              <Route path="/analytics" element={<AnalyticsCharts />} />
              <Route path="/charts" element={<Navigate to="/analytics" replace />} />
              <Route path="*" element={<Navigate to="/daily" replace />} />
            </Routes>
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

          <div className="flex items-center gap-1.5 text-xs text-[#c2cbc5]">
            <span>Made by <strong className="text-[#f8fffa] font-semibold">Varun</strong> with</span>
            <Heart className="w-3.5 h-3.5 text-[#ff65d8] fill-[#ff65d8] inline animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
