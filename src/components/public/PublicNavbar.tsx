import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Terminal, Radio } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFineTrack } from '@/context/FineTrackContext';

interface PublicNavbarProps {
  onOpenLogin: () => void;
  onNavigateToAdmin: () => void;
  activeTab?: 'daily' | 'summary' | 'all' | 'analytics';
  setActiveTab?: (tab: 'daily' | 'summary' | 'all' | 'analytics') => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onOpenLogin,
  onNavigateToAdmin,
}) => {
  const { isAdmin } = useAuth();
  const { realtimeStatus } = useFineTrack();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const p = location.pathname;
    if (p.startsWith('/summary')) return 'summary';
    if (p.startsWith('/records') || p.startsWith('/all')) return 'all';
    if (p.startsWith('/analytics') || p.startsWith('/charts')) return 'analytics';
    return 'daily';
  };

  const activeTab = getActiveTab();

  return (
    <header className="sticky top-0 z-40 bg-[#020303]/95 backdrop-blur-xs border-b border-[#304c3b] font-mono">
      <div className="h-0.5 w-full bg-[#38ff8e]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-[#090e0b] border border-[#38ff8e] text-[#38ff8e]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-[#f8fffa] uppercase">
                  FineTrack
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#090e0b] text-[#38ff8e] border border-[#304c3b]">
                  ₹100 - ₹500/Day
                </span>
              </div>
              <p className="text-[10px] text-[#c2cbc5] font-mono uppercase tracking-wider hidden sm:block">
                Live Late Tracking & Fine Management System
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="hidden md:flex items-center border border-[#304c3b] bg-[#090e0b]">
            <button
              onClick={() => navigate('/daily')}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase font-bold tracking-wider ${
                activeTab === 'daily'
                  ? 'bg-[#38ff8e] text-[#020303]'
                  : 'text-[#d3dbd5] hover:text-[#38ff8e] hover:bg-[#020303]'
              }`}
            >
              Daily Tracker
            </button>
            <button
              onClick={() => navigate('/summary')}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase font-bold tracking-wider border-l border-[#304c3b] ${
                activeTab === 'summary'
                  ? 'bg-[#38ff8e] text-[#020303]'
                  : 'text-[#d3dbd5] hover:text-[#38ff8e] hover:bg-[#020303]'
              }`}
            >
              Individual Summary
            </button>
            <button
              onClick={() => navigate('/records')}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase font-bold tracking-wider border-l border-[#304c3b] ${
                activeTab === 'all'
                  ? 'bg-[#38ff8e] text-[#020303]'
                  : 'text-[#d3dbd5] hover:text-[#38ff8e] hover:bg-[#020303]'
              }`}
            >
              All Records & Filters
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase font-bold tracking-wider border-l border-[#304c3b] ${
                activeTab === 'analytics'
                  ? 'bg-[#38ff8e] text-[#020303]'
                  : 'text-[#d3dbd5] hover:text-[#38ff8e] hover:bg-[#020303]'
              }`}
            >
              Charts & Trends
            </button>
          </nav>

          {/* Right Status & Admin CTA */}
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono uppercase font-bold text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] clip-corner-diagonal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono uppercase font-bold text-[#f8fffa] bg-[#090e0b] border border-[#304c3b] hover:border-[#38ff8e] hover:text-[#38ff8e]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#38ff8e]" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-[#304c3b] overflow-x-auto gap-1">
          <button
            onClick={() => navigate('/daily')}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold whitespace-nowrap ${
              activeTab === 'daily' ? 'bg-[#38ff8e] text-[#020303]' : 'text-[#c2cbc5] border border-[#304c3b]'
            }`}
          >
            Daily Tracker
          </button>
          <button
            onClick={() => navigate('/summary')}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold whitespace-nowrap ${
              activeTab === 'summary' ? 'bg-[#38ff8e] text-[#020303]' : 'text-[#c2cbc5] border border-[#304c3b]'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => navigate('/records')}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold whitespace-nowrap ${
              activeTab === 'all' ? 'bg-[#38ff8e] text-[#020303]' : 'text-[#c2cbc5] border border-[#304c3b]'
            }`}
          >
            All Records
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-[#38ff8e] text-[#020303]' : 'text-[#c2cbc5] border border-[#304c3b]'
            }`}
          >
            Charts
          </button>
        </div>
      </div>
    </header>
  );
};
