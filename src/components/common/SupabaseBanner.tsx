import React, { useState } from 'react';
import { Database, CheckCircle2, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFineTrack } from '@/context/FineTrackContext';
import { Modal } from './Modal';

export const SupabaseBanner: React.FC = () => {
  const { isSupabaseConfigured } = useAuth();
  const { realtimeStatus } = useFineTrack();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const envSample = `# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-[#020303] text-[#d3dbd5] text-xs py-2 px-4 border-b border-[#304c3b] font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-[#38ff8e] animate-pulse" />
            <span className="font-bold text-[#f8fffa] uppercase text-[11px] tracking-wider">
              SYS.FINETRACK // SIGNAL_ACTIVE
            </span>
            <span className="text-[#304c3b]">|</span>
            <span className="text-[#c2cbc5] text-[11px]">
              {isSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1.5 text-[#38ff8e]">
                  <CheckCircle2 className="w-3 h-3" />
                  POSTGRES_REALTIME: LOCKED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[#65f8ff]">
                  <Database className="w-3 h-3" />
                  STATE: LOCAL_SANDBOX_PROTOCOL
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[#c2cbc5] text-[11px]">
              ADMIN: <code className="bg-[#090e0b] px-1.5 py-0.5 border border-[#304c3b] text-[#f8fffa]">fine@gmail.com</code> / <code className="bg-[#090e0b] px-1.5 py-0.5 border border-[#304c3b] text-[#38ff8e]">fine@sof.admn</code>
            </span>
            <button
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#090e0b] hover:bg-[#38ff8e] text-[#c2cbc5] hover:text-[#020303] border border-[#304c3b] hover:border-[#38ff8e] uppercase text-[10px] font-bold"
            >
              <Terminal className="w-3 h-3 text-[#38ff8e] group-hover:text-[#020303]" />
              <span>SQL_SCHEMA</span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        title="DATABASE_ARCHITECTURE_SETUP"
        description="Run Supabase DDL schema with database-level Row Level Security and Realtime publication."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs font-mono text-[#d3dbd5]">
          <div className="p-3 bg-[#020303] border border-[#304c3b]">
            <div className="flex justify-between items-center mb-1 text-[#c2cbc5]">
              <span>ENV_SPECIFICATION (.env.local)</span>
              <button
                onClick={copyEnv}
                className="flex items-center gap-1 text-[#38ff8e] hover:text-[#65f8ff] uppercase font-bold"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
            <pre className="text-[#38ff8e] overflow-x-auto whitespace-pre">{envSample}</pre>
          </div>

          <div className="space-y-2">
            <h5 className="font-display font-bold text-[#f8fffa] uppercase tracking-wide">Deployment Pipeline:</h5>
            <ol className="list-decimal list-inside space-y-1.5 text-[#c2cbc5] leading-relaxed">
              <li>
                Initialize project instance at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#65f8ff] underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a>.
              </li>
              <li>
                Execute DDL from <code className="bg-[#020303] px-1 py-0.5 border border-[#304c3b] text-[#38ff8e]">supabase/schema.sql</code> inside the SQL editor.
              </li>
              <li>
                Register administrative user via <code className="bg-[#020303] px-1 py-0.5 border border-[#304c3b] text-[#38ff8e]">supabase/admin_setup.sql</code>:
                <br /><span className="text-[#f8fffa]">EMAIL: fine@gmail.com</span>
                <br /><span className="text-[#f8fffa]">PASSWORD: fine@sof.admn</span>
              </li>
              <li>
                Assign API keys into <code className="bg-[#020303] px-1 py-0.5 border border-[#304c3b] text-[#38ff8e]">.env.local</code>.
              </li>
            </ol>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-[#020303] border border-[#38ff8e] text-[#38ff8e]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>PostgreSQL RLS and Realtime publications compiled with 0 mock data.</span>
          </div>
        </div>
      </Modal>
    </>
  );
};
